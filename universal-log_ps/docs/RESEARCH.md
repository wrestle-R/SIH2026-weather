# ULPF Research and Differentiation

## Problem baseline

SIH26156 asks for a vendor-independent, lossless, scalable and air-gap deployable framework that converts perimeter-device events into a common analytics-ready representation. Its evaluation package calls for source code, setup instructions, a two-page architecture document, a two-minute demo and a five-slide presentation.

## Standards selected

- **OCSF 1.9** is the canonical contract because it is vendor-neutral and security-native. Version 1.9 added the `record_integrity` profile and attestation objects at the base-event level.
- **ECS 9.5** is an export adapter because many SIEM deployments already understand fields such as `event.original`, `event.hash`, `source.ip` and `destination.ip`.
- **RFC 5424**, ArcSight CEF and IBM LEEF define the wire formats implemented by their respective parsers.
- JSON, NDJSON, XML, CSV and key-value parsers cover common open and proprietary exports.

## Differentiation

Mature collectors already move and transform logs. ULPF's jury proof focuses on three auditable properties often hidden behind pipeline configuration:

1. Raw evidence is retained byte-for-byte and fingerprinted before interpretation.
2. Every normalized value includes its source path and transform.
3. A new source can be mapped at runtime through a bounded manifest without shipping executable parser code.

The implementation is deterministic by design. It does not use an external LLM to guess security semantics, which keeps air-gapped behavior repeatable and reviewable.

## Primary references

- [SIH26156 problem statement listing](https://sih2026.vuce.in/ps/SIH26156)
- [OCSF schema repository](https://github.com/ocsf/ocsf-schema)
- [OCSF 1.9 release notes](https://github.com/ocsf/ocsf-schema/releases)
- [RFC 5424: The Syslog Protocol](https://datatracker.ietf.org/doc/html/rfc5424)
- [IBM LEEF event components](https://www.ibm.com/docs/en/dsm?topic=overview-leef-event-components)
- [ArcSight CEF implementation standard](https://www.microfocus.com/documentation/arcsight/arcsight-smartconnectors-25.1/pdfdoc/cef-implementation-standard/cef-implementation-standard.pdf)
- [Elastic Common Schema event fields](https://www.elastic.co/docs/reference/ecs/ecs-event)
- [OpenTelemetry Logs Data Model](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
