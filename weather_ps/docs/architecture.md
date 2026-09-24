# Technical Architecture — Varunetra

## Reference flow

```text
IMD / MOSDAC / SACHET / CWC / datasets / citizen app / news-social signals
                                  │
                                  ▼
                    Connectors + schema registry
                                  │
                                  ▼
                 Kafka-compatible streaming backbone
                                  │
               ┌──────────────────┼──────────────────┐
               ▼                  ▼                  ▼
        normalization      media analysis      source trust
               │                  │                  │
               └──────────────────┼──────────────────┘
                                  ▼
              spatio-temporal clustering + deduplication
                                  │
                                  ▼
               multimodal verification + confidence score
                                  │
                   ┌──────────────┴──────────────┐
                   ▼                             ▼
            human review                 auto-publish policy
                   └──────────────┬──────────────┘
                                  ▼
        PostGIS + object storage + search + analytics warehouse
                                  │
                                  ▼
             dashboard / APIs / alerts / research exports
```

## Suggested production stack

- **Edge/API gateway:** rate limiting, authentication, source quotas, and request signatures
- **Streaming:** Apache Kafka or Redpanda with a topic per source family and a dead-letter topic
- **Stream processing:** Apache Flink or Spark Structured Streaming for enrichment, windows, and clustering
- **Operational store:** PostgreSQL with PostGIS for verified event state and administrative joins
- **Search:** OpenSearch for multilingual full-text and metadata retrieval
- **Object storage:** S3-compatible storage for original photos, videos, bulletins, and model artefacts
- **Analytics:** ClickHouse or Apache Druid for high-volume time-series/event analytics
- **ML services:** Python/FastAPI services for classifiers, embeddings, media forensics, and confidence calibration
- **Web:** Next.js dashboard with server-side authorization and streamed updates through SSE or WebSockets
- **Observability:** OpenTelemetry, Prometheus, and Grafana with per-source freshness SLOs

## Canonical event model

Every normalized report should retain provenance and include:

- source ID, source class, trust history, and original URI
- ingest, observed, and published timestamps
- raw text plus normalized multilingual text
- latitude/longitude, accuracy, district, state, and geocoding method
- weather-event taxonomy and severity
- media hashes, perceptual hashes, EXIF findings, and object-storage references
- duplicate-cluster ID and similarity evidence
- verification score, contributing signals, model version, and human-review state
- immutable audit records for every status change

## Verification model

Use a calibrated ensemble rather than one binary classifier. Candidate features include source history, account age, official-source agreement, distance to sensors, time agreement, cross-source consensus, image/video reuse, metadata consistency, language-based claim classification, and anomalous posting behaviour.

Critical alerts must never rely solely on a generative model. Confidence thresholds should determine whether a record is held, queued for review, or eligible for policy-controlled dissemination.

## Scale and resilience

- Partition streams by geohash and event time.
- Use watermarks to handle late-arriving reports.
- Make connectors idempotent and persist source cursors.
- Cache official feeds according to provider guidance, including ETags where available.
- Keep raw inputs immutable so model decisions remain auditable.
- Degrade gracefully: official warnings remain visible when public-signal models are unavailable.

## Security and governance

- remove or coarsen personally identifiable location data from public views
- use role-based access for national, state, and district operators
- encrypt citizen media and identifiers at rest
- define retention policies per source agreement
- document consent and grievance workflows for citizen submissions
- run bias and calibration reviews across languages, regions, and connectivity levels

