# Declarative Parser Plugin Guide

Parser manifests are data, not executable plugins. They identify the producer, select a base parser and map extracted fields into approved OCSF targets.

```yaml
id: custom.edge-gateway
name: Edge Gateway Text
version: 1.0.0
vendor: Demo Vendor
product: Border Gateway
format: kv
ocsfClassUid: 4001
mappings:
  - from: src
    to: src_endpoint.ip
    transform: ip
    required: true
  - from: dst
    to: dst_endpoint.ip
    transform: ip
    required: true
  - from: verdict
    to: action
    transform: lowercase
```

## Supported transforms

`string`, `integer`, `lowercase`, `timestamp`, `ip`, `protocol` and `severity` are the only transforms accepted. The API rejects unknown targets, missing required fields, invalid IP values and failed numeric or timestamp coercions.

## Proprietary text

An optional `extraction.pattern` may use named JavaScript capture groups such as `(?<src>...)`. Patterns are limited to 500 characters and checked with `safe-regex2`. Input remains capped at 1 MB. These guards reduce risk but do not provide the hard execution deadline of a sandboxed RE2 worker, which is recommended for production.

## Onboarding sequence

1. Register the vendor, product, manifest ID and base format.
2. Paste a representative event and optionally define extraction captures.
3. Map source fields to approved OCSF targets with explicit transforms.
4. Run validation and inspect evidence, lineage and the normalized preview.
5. Save the manifest locally or download YAML for version control and review.
