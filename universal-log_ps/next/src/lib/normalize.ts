import { createHash, randomUUID } from "node:crypto";
import { XMLParser } from "fast-xml-parser";
import Papa from "papaparse";
import safeRegex from "safe-regex2";
import type {
  ConcreteLogFormat,
  EcsEvent,
  FieldLineage,
  JsonValue,
  NormalizeRequest,
  NormalizationBatch,
  NormalizedEvent,
  OcsfEvent,
  ParserManifest,
} from "@/lib/types";

export const MAX_INPUT_BYTES = 1_000_000;
export const MAX_EVENTS_PER_BATCH = 100;

const RFC5424 = /^<(\d{1,3})>(\d+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(-|(?:\[[\s\S]*?\]))(?:\s+([\s\S]*))?$/;
const IPV4_OR_V6 = /^(?:\d{1,3}(?:\.\d{1,3}){3}|[a-fA-F0-9:]+)$/;
const ALLOWED_TARGETS = new Set([
  "message", "time", "severity_id", "severity", "action", "status_id", "status",
  "src_endpoint.ip", "src_endpoint.port", "src_endpoint.hostname",
  "dst_endpoint.ip", "dst_endpoint.port", "dst_endpoint.hostname",
  "device.name", "device.ip", "device.vendor_name", "connection_info.protocol_name",
]);

type FlatRecord = Record<string, JsonValue>;

function sha256(input: Buffer | string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
}

function asJsonValue(value: unknown): JsonValue {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return value as JsonValue;
  if (Array.isArray(value)) return value.map(asJsonValue);
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, nested]) => [key, asJsonValue(nested)]));
  }
  return String(value);
}

function flatten(input: unknown, prefix = "", target: FlatRecord = {}): FlatRecord {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    if (prefix) target[prefix] = asJsonValue(input);
    return target;
  }
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) flatten(value, path, target);
    else target[path] = asJsonValue(value);
  }
  return target;
}

function parseKeyValue(text: string): FlatRecord {
  const output: FlatRecord = {};
  const matcher = /(?:^|\s)([A-Za-z0-9_.@-]+)=(?:"((?:\\.|[^"])*)"|'([^']*)'|([\s\S]*?))(?=\s+[A-Za-z0-9_.@-]+=|$)/g;
  for (const match of text.matchAll(matcher)) output[match[1]] = (match[2] ?? match[3] ?? match[4] ?? "").replace(/\\"/g, '"');
  return output;
}

function parseCef(text: string): FlatRecord[] {
  const match = text.match(/^CEF:(\d+)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([^|]*)\|([\s\S]*)$/);
  if (!match) throw new Error("CEF header is invalid or incomplete.");
  return [{
    "cef.version": match[1], vendor: match[2], product: match[3], productVersion: match[4], eventId: match[5],
    name: match[6], severity: match[7], ...parseKeyValue(match[8]),
  }];
}

function parseLeef(text: string): FlatRecord[] {
  const parts = text.split("|");
  if (parts.length < 6 || !parts[0].startsWith("LEEF:")) throw new Error("LEEF header is invalid or incomplete.");
  const isV2 = parts[0] === "LEEF:2.0";
  const delimiter = isV2 ? (parts[5] || "\t") : "\t";
  const payload = parts.slice(isV2 ? 6 : 5).join("|");
  const attrs: FlatRecord = {};
  for (const token of payload.split(delimiter === "x09" || delimiter === "0x09" ? "\t" : delimiter)) {
    const splitAt = token.indexOf("=");
    if (splitAt > 0) attrs[token.slice(0, splitAt).trim()] = token.slice(splitAt + 1).trim();
  }
  return [{ leefVersion: parts[0].slice(5), vendor: parts[1], product: parts[2], productVersion: parts[3], eventId: parts[4], ...attrs }];
}

function parseSyslog(text: string): FlatRecord[] {
  const match = text.match(RFC5424);
  if (!match) throw new Error("Expected an RFC 5424 message with PRI, version, timestamp, host, app, process and message ID.");
  const priority = Number(match[1]);
  const structured = match[8] === "-" ? {} : parseKeyValue(match[8].replace(/^\[[^\s\]]+\s?/, "").replace(/\]$/, ""));
  return [{
    priority, facility: Math.floor(priority / 8), severity: priority % 8, version: match[2], timestamp: match[3],
    hostname: match[4], appName: match[5], processId: match[6], messageId: match[7], ...structured, message: match[9] ?? "",
  }];
}

function parseJson(text: string): FlatRecord[] {
  try {
    const value = JSON.parse(text) as unknown;
    const records = Array.isArray(value) ? value : [value];
    return records.map((record) => flatten(record));
  } catch {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) throw new Error("JSON is malformed.");
    return lines.map((line, index) => {
      try { return flatten(JSON.parse(line)); }
      catch { throw new Error(`NDJSON line ${index + 1} is malformed.`); }
    });
  }
}

function parseXml(text: string): FlatRecord[] {
  const parsed = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@" }).parse(text) as Record<string, unknown>;
  const root = parsed.events ?? parsed.event ?? Object.values(parsed)[0];
  if (root && typeof root === "object" && !Array.isArray(root) && "event" in (root as Record<string, unknown>)) {
    const nested = (root as Record<string, unknown>).event;
    return (Array.isArray(nested) ? nested : [nested]).map((item) => flatten(item));
  }
  return (Array.isArray(root) ? root : [root]).map((item) => flatten(item));
}

function parseCsv(text: string): FlatRecord[] {
  const result = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true, transformHeader: (header) => header.trim() });
  if (result.errors.length) throw new Error(`CSV parse error: ${result.errors[0].message}`);
  return result.data.map((record) => asJsonValue(record) as FlatRecord);
}

export function detectFormat(text: string): { format: ConcreteLogFormat; confidence: number } {
  const trimmed = text.trim();
  if (/^(?:<\d{1,3}>)?CEF:\d+\|/.test(trimmed)) return { format: "cef", confidence: 0.99 };
  if (/^(?:<\d{1,3}>)?LEEF:\d+(?:\.\d+)?\|/.test(trimmed)) return { format: "leef", confidence: 0.99 };
  if (RFC5424.test(trimmed)) return { format: "syslog", confidence: 0.98 };
  if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) return { format: "json", confidence: 0.96 };
  if (trimmed.startsWith("<") && trimmed.endsWith(">")) return { format: "xml", confidence: 0.94 };
  const firstLine = trimmed.split(/\r?\n/, 1)[0];
  if (firstLine.includes(",") && /^[^=,]+(?:,[^=,]+)+$/.test(firstLine)) return { format: "csv", confidence: 0.87 };
  if (Object.keys(parseKeyValue(trimmed)).length >= 3) return { format: "kv", confidence: 0.82 };
  throw new Error("No supported log format could be detected.");
}

function parseByFormat(format: ConcreteLogFormat, text: string): FlatRecord[] {
  const parsers: Record<ConcreteLogFormat, (value: string) => FlatRecord[]> = {
    cef: parseCef, leef: parseLeef, syslog: parseSyslog, json: parseJson, xml: parseXml, csv: parseCsv,
    kv: (value) => [parseKeyValue(value)],
  };
  const records = parsers[format](text);
  if (!records.length) throw new Error("The payload did not contain any events.");
  return records.slice(0, MAX_EVENTS_PER_BATCH);
}

function first(record: FlatRecord, candidates: string[]): { path: string; value: JsonValue } | undefined {
  for (const path of candidates) {
    const direct = record[path];
    if (direct !== undefined && direct !== "") return { path, value: direct };
    const suffix = Object.keys(record).find((key) => key.toLowerCase().endsWith(`.${path.toLowerCase()}`));
    if (suffix && record[suffix] !== "") return { path: suffix, value: record[suffix] };
  }
}

function toNumber(value: JsonValue | undefined): number | undefined {
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function severityOf(record: FlatRecord): { id: number; name: string; source?: { path: string; value: JsonValue } } {
  const source = first(record, ["severity", "sev", "level", "priority", "alert.severity"]);
  const raw = String(source?.value ?? "unknown").toLowerCase();
  if (source?.path === "alert.severity") {
    const suricata = Number(source.value);
    const id = suricata === 1 ? 6 : suricata === 2 ? 5 : 3;
    return { id, name: ["Unknown", "Informational", "Low", "Medium", "High", "Critical", "Fatal"][id], source };
  }
  const numeric = Number(raw);
  let id = 0;
  if (raw.includes("fatal") || raw.includes("critical")) id = 6;
  else if (raw.includes("high") || (Number.isFinite(numeric) && numeric >= 8)) id = 5;
  else if (raw.includes("warn") || raw.includes("medium") || (Number.isFinite(numeric) && numeric >= 5)) id = 4;
  else if (raw.includes("low") || (Number.isFinite(numeric) && numeric >= 3)) id = 3;
  else if (raw.includes("info") || Number.isFinite(numeric)) id = 2;
  return { id, name: ["Unknown", "Informational", "Low", "Medium", "High", "Critical", "Fatal"][id], source };
}

function actionOf(record: FlatRecord): { value: string; source?: { path: string; value: JsonValue } } {
  const source = first(record, ["action", "act", "alert.action", "disposition", "status"]);
  const value = String(source?.value ?? "unknown").toLowerCase();
  if (["deny", "denied", "drop", "dropped", "block", "blocked", "reject"].some((item) => value.includes(item))) return { value: "Blocked", source };
  if (["allow", "allowed", "accept", "pass", "passed"].some((item) => value.includes(item))) return { value: "Allowed", source };
  return { value: value === "unknown" ? "Unknown" : String(source?.value), source };
}

function timestampOf(record: FlatRecord): { time: number; source?: { path: string; value: JsonValue } } {
  const source = first(record, ["timestamp", "time", "datetime", "date", "rt", "devTime", "eventTime"]);
  if (!source) return { time: Date.now() };
  const parsed = Date.parse(String(source.value));
  if (Number.isFinite(parsed)) return { time: parsed, source };
  if (/^\d{10,13}$/.test(String(source.value))) {
    const numeric = Number(source.value);
    return { time: String(source.value).length === 10 ? numeric * 1000 : numeric, source };
  }
  return { time: Date.now(), source };
}

function addLineage(lineage: FieldLineage[], source: { path: string; value: JsonValue } | undefined, targetPath: string, transform: string, confidence = 0.98) {
  if (source) lineage.push({ sourcePath: source.path, targetPath, transform, confidence, sourceValue: source.value });
}

function parseWithManifest(text: string, manifest: ParserManifest): FlatRecord[] {
  if (manifest.extraction?.pattern) {
    if (!safeRegex(manifest.extraction.pattern)) throw new Error("Manifest extraction pattern was rejected as potentially unsafe.");
    const match = text.match(new RegExp(manifest.extraction.pattern));
    if (!match?.groups) throw new Error("Manifest extraction pattern did not match or has no named capture groups.");
    return [asJsonValue(match.groups) as FlatRecord];
  }
  return parseByFormat(manifest.format, text);
}

function setNested(target: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let cursor = target;
  for (let index = 0; index < keys.length - 1; index += 1) {
    cursor[keys[index]] ??= {};
    cursor = cursor[keys[index]] as Record<string, unknown>;
  }
  cursor[keys.at(-1)!] = value;
}

function transformManifestValue(value: JsonValue, transform: ParserManifest["mappings"][number]["transform"]): JsonValue {
  switch (transform) {
    case "integer": return Number.parseInt(String(value), 10);
    case "lowercase": return String(value).toLowerCase();
    case "timestamp": return Date.parse(String(value));
    case "ip": return IPV4_OR_V6.test(String(value)) ? String(value) : "invalid";
    case "protocol": return String(value).toUpperCase();
    case "severity": return severityOf({ severity: value }).id;
    default: return String(value);
  }
}

function buildOcsf(record: FlatRecord, rawText: string, sourceId: string, now: number, manifest?: ParserManifest): { event: Omit<OcsfEvent, "attestation_list">; lineage: FieldLineage[] } {
  const lineage: FieldLineage[] = [];
  const sourceIp = first(record, ["src_ip", "srcip", "src", "source.ip", "source.address", "client_ip"]);
  const sourcePort = first(record, ["src_port", "srcport", "spt", "source.port", "srcPort"]);
  const destinationIp = first(record, ["dest_ip", "dst_ip", "dstip", "dst", "destination.ip", "destination.address"]);
  const destinationPort = first(record, ["dest_port", "dst_port", "dstport", "dpt", "destination.port", "dstPort"]);
  const protocol = first(record, ["proto", "protocol", "network.transport", "service"]);
  const deviceName = first(record, ["device", "devname", "hostname", "host", "observer.name"]);
  const deviceIp = first(record, ["deviceAddress", "device.ip", "observer.ip"]);
  const message = first(record, ["message", "msg", "name", "alert.signature", "description"]);
  const timestamp = timestampOf(record);
  const severity = severityOf(record);
  const action = actionOf(record);
  const finding = Boolean(first(record, ["alert.signature", "signature", "threat", "eventId"])) || manifest?.ocsfClassUid === 2004;
  const classUid = finding ? 2004 : 4001;
  const activityId = finding ? 1 : action.value === "Blocked" ? 2 : action.value === "Allowed" ? 1 : 0;
  const statusId = action.value === "Blocked" ? 2 : action.value === "Allowed" ? 1 : 0;

  addLineage(lineage, sourceIp, "src_endpoint.ip", "ip");
  addLineage(lineage, sourcePort, "src_endpoint.port", "integer");
  addLineage(lineage, destinationIp, "dst_endpoint.ip", "ip");
  addLineage(lineage, destinationPort, "dst_endpoint.port", "integer");
  addLineage(lineage, protocol, "connection_info.protocol_name", "protocol");
  addLineage(lineage, deviceName, "device.name", "string");
  addLineage(lineage, timestamp.source, "time", "timestamp");
  addLineage(lineage, severity.source, "severity_id", "severity-map");
  addLineage(lineage, action.source, "action", "action-map");
  addLineage(lineage, message, "message", "string");

  const event: Omit<OcsfEvent, "attestation_list"> = {
    activity_id: activityId,
    activity_name: finding ? "Create" : action.value,
    category_uid: finding ? 2 : 4,
    category_name: finding ? "Findings" : "Network Activity",
    class_uid: classUid,
    class_name: finding ? "Detection Finding" : "Network Activity",
    type_uid: classUid * 100 + activityId,
    type_name: `${finding ? "Detection Finding" : "Network Activity"}: ${finding ? "Create" : action.value}`,
    time: timestamp.time,
    severity_id: severity.id,
    severity: severity.name,
    status_id: statusId,
    status: statusId === 2 ? "Failure" : statusId === 1 ? "Success" : "Unknown",
    message: String(message?.value ?? `${action.value} network event`),
    metadata: {
      version: "1.9.0", product: { name: manifest?.product ?? "ULPF Normalizer", vendor_name: manifest?.vendor ?? "ULPF" },
      logged_time: now, profiles: ["record_integrity"], uid: randomUUID(),
    },
    src_endpoint: sourceIp || sourcePort ? { ip: sourceIp ? String(sourceIp.value) : undefined, port: toNumber(sourcePort?.value) } : undefined,
    dst_endpoint: destinationIp || destinationPort ? { ip: destinationIp ? String(destinationIp.value) : undefined, port: toNumber(destinationPort?.value) } : undefined,
    device: deviceName || deviceIp ? { name: deviceName ? String(deviceName.value) : sourceId, ip: deviceIp ? String(deviceIp.value) : undefined, vendor_name: manifest?.vendor } : { name: sourceId, vendor_name: manifest?.vendor },
    connection_info: protocol ? { protocol_name: String(protocol.value).toUpperCase() } : undefined,
    action: action.value,
    raw_data: rawText,
    unmapped: { ...record },
  };

  if (manifest) {
    for (const [path, value] of Object.entries(manifest.defaults ?? {})) if (ALLOWED_TARGETS.has(path)) setNested(event as unknown as Record<string, unknown>, path, value);
    for (const mapping of manifest.mappings) {
      if (!ALLOWED_TARGETS.has(mapping.to)) throw new Error(`Manifest target is not allowed: ${mapping.to}`);
      const value = record[mapping.from];
      if (value === undefined) {
        if (mapping.required) throw new Error(`Required manifest field is missing: ${mapping.from}`);
        continue;
      }
      const transformed = transformManifestValue(value, mapping.transform);
      if ((mapping.transform === "integer" || mapping.transform === "timestamp") && !Number.isFinite(transformed)) throw new Error(`Transform failed for ${mapping.from}.`);
      if (mapping.transform === "ip" && transformed === "invalid") throw new Error(`Invalid IP address in ${mapping.from}.`);
      setNested(event as unknown as Record<string, unknown>, mapping.to, transformed);
      lineage.push({ sourcePath: mapping.from, targetPath: mapping.to, transform: mapping.transform, confidence: 1, sourceValue: value });
    }
  }
  return { event, lineage };
}

function toEcs(event: OcsfEvent, evidenceHash: string, sourceId: string): EcsEvent {
  return {
    "@timestamp": new Date(event.time).toISOString(), message: event.message, ecs: { version: "9.5.0" },
    event: {
      id: event.metadata.uid, kind: event.class_uid === 2004 ? "alert" : "event", category: event.category_name.toLowerCase(),
      type: event.activity_name.toLowerCase(), action: event.action ?? "unknown", outcome: event.status.toLowerCase(),
      severity: event.severity_id, hash: evidenceHash, original: event.raw_data, provider: event.metadata.product.vendor_name,
    },
    source: event.src_endpoint as Record<string, JsonValue> | undefined,
    destination: event.dst_endpoint as Record<string, JsonValue> | undefined,
    observer: event.device as Record<string, JsonValue> | undefined,
    network: event.connection_info as Record<string, JsonValue> | undefined,
    labels: { source_id: sourceId, ocsf_version: event.metadata.version },
  };
}

export function normalize(request: NormalizeRequest): NormalizationBatch {
  const startedAt = performance.now();
  const rawBytes = Buffer.from(request.rawBase64, "base64");
  if (!rawBytes.length) throw new Error("The evidence payload is empty.");
  if (rawBytes.length > MAX_INPUT_BYTES) throw new Error(`Input exceeds the ${MAX_INPUT_BYTES}-byte demo limit.`);
  const rawText = rawBytes.toString("utf8");
  const detected = request.manifest
    ? { format: request.manifest.format, confidence: 1 }
    : request.format && request.format !== "auto"
      ? { format: request.format, confidence: 1 }
      : detectFormat(rawText);
  const format = request.manifest?.format ?? detected.format;
  const records = request.manifest ? parseWithManifest(rawText, request.manifest) : parseByFormat(format, rawText);
  const now = Date.now();
  const batchId = randomUUID();
  const chainUid = `ulpf:${batchId}`;
  const rawHash = sha256(rawBytes);
  const sourceId = request.sourceId ?? "interactive-input";
  const warnings = [];
  if (records.length === MAX_EVENTS_PER_BATCH) warnings.push({ code: "BATCH_TRUNCATED", message: `Only the first ${MAX_EVENTS_PER_BATCH} events were processed.` });
  let previous: NormalizedEvent | undefined;

  const events = records.map((record, index): NormalizedEvent => {
    const built = buildOcsf(record, rawText, sourceId, now, request.manifest);
    const uid = `evt_${sha256(`${batchId}:${index}:${rawHash}`).slice(0, 20)}`;
    built.event.metadata.uid = uid;
    const fingerprint = sha256(stableStringify({ ...built.event, sequence: index, previous: previous?.integrity.fingerprint }));
    const integrity = {
      algorithm: "SHA-256" as const, fingerprint, authorityUid: "ulpf-demo-normalizer", chainUid, sequence: index + 1,
      previousEvent: previous ? { uid: previous.uid, fingerprint: previous.integrity.fingerprint, typeUid: previous.ocsf.type_uid } : undefined,
      verified: true,
    };
    const ocsf: OcsfEvent = {
      ...built.event,
      attestation_list: [{
        fingerprint: { algorithm: "SHA-256", value: fingerprint }, authority_uid: integrity.authorityUid, chain_uid: chainUid,
        prev_event: integrity.previousEvent ? { uid: integrity.previousEvent.uid, fingerprint: { algorithm: "SHA-256", value: integrity.previousEvent.fingerprint }, type_uid: integrity.previousEvent.typeUid } : undefined,
      }],
    };
    const normalized: NormalizedEvent = {
      uid, sourceId, format, parserId: request.manifest?.id ?? `builtin.${format}`, parserVersion: request.manifest?.version ?? "1.0.0",
      evidence: { encoding: "base64", data: request.rawBase64, text: rawText, byteLength: rawBytes.length, sha256: rawHash, mediaType: request.mediaType ?? "text/plain" },
      ocsf, ecs: toEcs(ocsf, rawHash, sourceId), lineage: built.lineage, integrity,
    };
    previous = normalized;
    return normalized;
  });

  return {
    batchId, chainUid, detectedFormat: format, detectionConfidence: request.manifest ? 1 : detected.confidence,
    parser: { id: request.manifest?.id ?? `builtin.${format}`, version: request.manifest?.version ?? "1.0.0", sourceId },
    events, warnings, errors: [],
    stats: { inputBytes: rawBytes.length, eventCount: records.length, successCount: events.length, durationMs: Number((performance.now() - startedAt).toFixed(2)) },
  };
}

export function verifyBatch(batch: NormalizationBatch): boolean {
  let previousFingerprint: string | undefined;
  return batch.events.every((event, index) => {
    const unsigned = { ...event.ocsf } as Partial<OcsfEvent>;
    delete unsigned.attestation_list;
    const calculated = sha256(stableStringify({ ...unsigned, sequence: index, previous: previousFingerprint }));
    const valid = calculated === event.integrity.fingerprint && event.integrity.previousEvent?.fingerprint === previousFingerprint;
    previousFingerprint = event.integrity.fingerprint;
    return index === 0 ? calculated === event.integrity.fingerprint && !event.integrity.previousEvent : valid;
  });
}
