# SIH Jury Demo and Presentation Guide

## Two-minute demonstration

**0:00-0:15 | Frame the problem**

Open the Overview. Say: “Perimeter devices speak different formats. ULPF gives them one security language without discarding the original evidence.” Select **Watch live demo**; the showcase begins automatically.

**0:15-0:55 | Prove normalization**

Let the showcase cycle from Palo Alto CEF to Suricata JSON and RFC 5424 Syslog. Point out the automatic format confidence, OCSF output, field lineage, and verified evidence fingerprint. Then open **Parser Lab** and upload `next/public/samples/palo-alto-cef.log` to prove that the same pipeline accepts files.

**0:55-1:20 | Prove losslessness**

Open Integrity. Verify evidence successfully. Select Simulate Tamper, verify again and show the failure. State: “This milestone proves modification through hashes and predecessor links. Digital signer authenticity is a production extension.”

**1:20-1:45 | Prove onboarding**

Open Sources. Walk through the bundled custom key-value example, validate the mapping and download the YAML manifest. Emphasize that the source was added as reviewed configuration, not executable code.

**1:45-2:00 | Close on deployment**

Open Events and show one search across formats. Close with: “The demo runs locally in one container. The same stateless parsing contract scales behind durable partitions while immutable evidence remains independently retrievable.”

## Five-slide technical presentation

1. **Problem:** fragmented perimeter formats delay correlation, forensics and analytics.
2. **Proof:** heterogeneous inputs become OCSF 1.9 while exact evidence and lineage remain attached.
3. **Architecture:** evidence seal, deterministic parser, normalizer, attestation and multi-target exports.
4. **Differentiator:** config-only onboarding, bounded transforms, offline runtime and explicit integrity boundary.
5. **Scale path:** durable ingestion, stateless workers, immutable Bronze storage, normalized lakehouse, DLQ and SIEM sinks.

## Jury questions

- **Is this another Logstash?** The demo focuses on a portable security contract, byte-level evidence, per-field lineage and runtime manifest onboarding. Production collectors can feed it rather than being replaced.
- **Where is AI?** Deterministic parsing is safer for forensic evidence. Normalized outputs are ML-ready, but an external model is not trusted to silently rewrite source semantics.
- **Can it prove who created an event?** Not yet. Hash chains prove unexpected modification; signatures and managed keys are required for producer authenticity.
- **Does it handle a billion events per day?** The architecture partitions cleanly, but this single-node UI is not presented as that benchmark.
