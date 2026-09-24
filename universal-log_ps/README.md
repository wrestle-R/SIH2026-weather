# Universal Log Pre-processing Framework

ULPF is the SIH 2026 reference implementation for problem statement **SIH26156**, proposed by the National Technical Research Organisation. It converts heterogeneous perimeter-device logs into lossless, traceable OCSF 1.9 events and portable ECS exports.

## What this milestone proves

- Real parsing for CEF, LEEF, RFC 5424 Syslog, JSON/NDJSON, XML, CSV and key-value logs.
- Exact raw-byte preservation, SHA-256 evidence fingerprints and tamper-evident batch chains.
- OCSF 1.9 Network Activity and Detection Finding normalization with field-level lineage.
- Config-only onboarding through bounded YAML/JSON parser manifests.
- Local browser persistence and OCSF, ECS, JSON and NDJSON export.
- Standalone container execution without runtime internet access.

This is a working single-node reference demo. Kafka, object storage and distributed workers are a documented production path, not capabilities claimed by this milestone.

## Quick start

```bash
cd /home/rdp/Desktop/code/SIH2026/universal-log_ps/next
npm install
npm run dev
```

Open `http://localhost:3000`. Select **Watch live demo** for the automatic jury showcase, then use **Parser Lab** to upload one of the files in `next/public/samples` or your own perimeter log.

## Verification

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

## Container

```bash
cd next
docker build -t ulpf-sih-demo .
docker run --rm -p 3000:3000 ulpf-sih-demo
curl http://127.0.0.1:3000/api/health
```

The built image contains the application, fonts and assets. It makes no runtime request to a cloud service.

## Documentation

- [Research and differentiation](docs/RESEARCH.md)
- [Two-page architecture brief](docs/ARCHITECTURE.md)
- [Schema and traceability](docs/SCHEMA-AND-TRACEABILITY.md)
- [Parser plugin guide](docs/PARSER-PLUGIN-GUIDE.md)
- [SIH demo and presentation](docs/SIH-DEMO-GUIDE.md)
- [Testing and scaling](docs/TESTING-AND-SCALING.md)

## Current boundaries

- Input is paste or file upload, not a live UDP/TCP listener.
- Session history and custom manifests are browser-local and capped.
- Hash chains prove unexpected modification. They do not provide signer authenticity because this demo intentionally has no key-management service.
- The implemented schema is the perimeter-focused subset used by the bundled scenarios, not every OCSF class.
