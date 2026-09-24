export const SUPPORTED_FORMATS = ["auto", "syslog", "json", "xml", "csv", "cef", "leef", "kv"] as const;
export type LogFormat = (typeof SUPPORTED_FORMATS)[number];
export type ConcreteLogFormat = Exclude<LogFormat, "auto">;

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface RawEvidence {
  encoding: "base64";
  data: string;
  text: string;
  byteLength: number;
  sha256: string;
  mediaType: string;
}

export interface FieldLineage {
  sourcePath: string;
  targetPath: string;
  transform: string;
  confidence: number;
  sourceValue?: JsonValue;
}

export interface IntegrityAttestation {
  algorithm: "SHA-256";
  fingerprint: string;
  authorityUid: string;
  chainUid: string;
  sequence: number;
  previousEvent?: { uid: string; fingerprint: string; typeUid: number };
  verified: boolean;
}

export interface OcsfEvent {
  activity_id: number;
  activity_name: string;
  category_uid: number;
  category_name: string;
  class_uid: number;
  class_name: string;
  type_uid: number;
  type_name: string;
  time: number;
  severity_id: number;
  severity: string;
  status_id: number;
  status: string;
  message: string;
  metadata: {
    version: "1.9.0";
    product: { name: string; vendor_name: string; version?: string };
    logged_time: number;
    profiles: string[];
    uid: string;
  };
  src_endpoint?: { ip?: string; port?: number; hostname?: string };
  dst_endpoint?: { ip?: string; port?: number; hostname?: string };
  device?: { name?: string; ip?: string; vendor_name?: string; type?: string };
  connection_info?: { protocol_name?: string; direction?: string; boundary?: string };
  action?: string;
  raw_data: string;
  unmapped: Record<string, JsonValue>;
  attestation_list: Array<{
    fingerprint: { algorithm: string; value: string };
    authority_uid: string;
    chain_uid: string;
    prev_event?: { uid: string; fingerprint: { algorithm: string; value: string }; type_uid: number };
  }>;
}

export interface EcsEvent {
  "@timestamp": string;
  message: string;
  ecs: { version: "9.5.0" };
  event: Record<string, JsonValue>;
  source?: Record<string, JsonValue>;
  destination?: Record<string, JsonValue>;
  observer?: Record<string, JsonValue>;
  network?: Record<string, JsonValue>;
  labels: Record<string, string>;
}

export interface NormalizedEvent {
  uid: string;
  sourceId: string;
  format: ConcreteLogFormat;
  parserId: string;
  parserVersion: string;
  evidence: RawEvidence;
  ocsf: OcsfEvent;
  ecs: EcsEvent;
  lineage: FieldLineage[];
  integrity: IntegrityAttestation;
}

export interface NormalizationWarning {
  code: string;
  message: string;
  eventIndex?: number;
}

export type AllowedTransform = "string" | "integer" | "lowercase" | "timestamp" | "ip" | "protocol" | "severity";

export interface ParserManifest {
  id: string;
  name: string;
  version: string;
  vendor: string;
  product: string;
  format: ConcreteLogFormat;
  detection?: { contains?: string; pattern?: string };
  extraction?: { pattern?: string };
  ocsfClassUid: 4001 | 2004;
  mappings: Array<{ from: string; to: string; transform: AllowedTransform; required?: boolean }>;
  defaults?: Record<string, JsonValue>;
}

export interface NormalizeRequest {
  rawBase64: string;
  format?: LogFormat;
  sourceId?: string;
  mediaType?: string;
  manifest?: ParserManifest;
}

export interface NormalizationBatch {
  batchId: string;
  chainUid: string;
  detectedFormat: ConcreteLogFormat;
  detectionConfidence: number;
  parser: { id: string; version: string; sourceId: string };
  events: NormalizedEvent[];
  warnings: NormalizationWarning[];
  errors: Array<{ code: string; message: string; eventIndex?: number }>;
  stats: { inputBytes: number; eventCount: number; successCount: number; durationMs: number };
}
