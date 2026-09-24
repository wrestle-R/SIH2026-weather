import { describe, expect, it } from "vitest";
import { detectFormat, normalize, verifyBatch } from "@/lib/normalize";
import { LOG_SAMPLES } from "@/lib/samples";
import type { ParserManifest } from "@/lib/types";

const encode = (value: string) => Buffer.from(value, "utf8").toString("base64");

describe("format detection and parsing", () => {
  for (const sample of LOG_SAMPLES) {
    it(`detects and normalizes ${sample.id}`, () => {
      expect(detectFormat(sample.content).format).toBe(sample.format);
      const batch = normalize({ rawBase64: encode(sample.content), sourceId: sample.id });
      expect(batch.errors).toEqual([]);
      expect(batch.events.length).toBeGreaterThan(0);
      expect(batch.events[0].format).toBe(sample.format);
      expect(batch.events[0].ocsf.metadata.version).toBe("1.9.0");
      expect(batch.events[0].ocsf.raw_data).toBe(sample.content);
      expect(batch.events[0].evidence.data).toBe(encode(sample.content));
      expect(batch.events[0].evidence.byteLength).toBe(Buffer.byteLength(sample.content));
      expect(batch.events[0].lineage.length).toBeGreaterThan(0);
      expect(verifyBatch(batch)).toBe(true);
      if (sample.id === "palo-alto-cef") expect(batch.events[0].ocsf.message).toBe("Known command and control endpoint");
    });
  }

  it("retains unknown fields under unmapped", () => {
    const content = '{"timestamp":"2026-09-24T00:00:00Z","src_ip":"2001:db8::8","future_vendor_field":"retained"}';
    const batch = normalize({ rawBase64: encode(content) });
    expect(batch.events[0].ocsf.unmapped.future_vendor_field).toBe("retained");
    expect(batch.events[0].ocsf.src_endpoint?.ip).toBe("2001:db8::8");
  });

  it("creates valid predecessor links for CSV batches", () => {
    const sample = LOG_SAMPLES.find((item) => item.format === "csv")!;
    const batch = normalize({ rawBase64: encode(sample.content) });
    expect(batch.events).toHaveLength(2);
    expect(batch.events[1].integrity.previousEvent?.fingerprint).toBe(batch.events[0].integrity.fingerprint);
    expect(verifyBatch(batch)).toBe(true);
  });

  it("detects normalized-event tampering", () => {
    const sample = LOG_SAMPLES[0];
    const batch = normalize({ rawBase64: encode(sample.content) });
    batch.events[0].ocsf.message = "modified after attestation";
    expect(verifyBatch(batch)).toBe(false);
  });

  it("rejects unsupported text", () => {
    expect(() => detectFormat("this is not a supported event")).toThrow(/supported log format/i);
  });
});

describe("declarative manifests", () => {
  const manifest: ParserManifest = {
    id: "custom.edge-test", name: "Edge Test", version: "1.0.0", vendor: "Test", product: "Gateway", format: "kv", ocsfClassUid: 4001,
    mappings: [
      { from: "client", to: "src_endpoint.ip", transform: "ip", required: true },
      { from: "server", to: "dst_endpoint.ip", transform: "ip", required: true },
      { from: "verdict", to: "action", transform: "lowercase" },
    ],
  };

  it("maps a custom source without executable code", () => {
    const batch = normalize({ rawBase64: encode("client=192.0.2.1 server=10.0.0.4 verdict=DENY"), manifest });
    expect(batch.events[0].ocsf.src_endpoint?.ip).toBe("192.0.2.1");
    expect(batch.events[0].ocsf.dst_endpoint?.ip).toBe("10.0.0.4");
    expect(batch.events[0].ocsf.action).toBe("deny");
  });

  it("rejects unsafe extraction expressions", () => {
    const unsafe = { ...manifest, extraction: { pattern: "(?<client>(a+)+$)" } };
    expect(() => normalize({ rawBase64: encode("aaaaaaaaaaaaaaaa!"), manifest: unsafe })).toThrow(/unsafe/i);
  });

  it("rejects unapproved target paths", () => {
    const invalid: ParserManifest = { ...manifest, mappings: [{ from: "client", to: "metadata.uid", transform: "string" }] };
    expect(() => normalize({ rawBase64: encode("client=192.0.2.1"), manifest: invalid })).toThrow(/not allowed/i);
  });
});
