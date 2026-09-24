# OCSF Schema, Evidence and Traceability

## Canonical event

ULPF emits the perimeter-focused subset of OCSF 1.9. Network traffic becomes class `4001` Network Activity. IDS and threat alerts become class `2004` Detection Finding. Required classification, occurrence, severity, status and metadata fields are populated together with source and destination endpoints, device context, connection protocol, action and message when available.

ECS is generated as an export view. It does not replace or mutate the canonical OCSF record.

## Lossless evidence envelope

Each normalized event carries:

- `evidence.data`: Base64 representation of the received bytes.
- `evidence.text`: UTF-8 display form used by text log formats.
- `evidence.byteLength`: length of the original byte buffer.
- `evidence.sha256`: fingerprint of the original bytes.
- `ocsf.raw_data`: readable original event text.
- `ocsf.unmapped`: every parsed source attribute, including fields not mapped into the common taxonomy.

For CSV and other batches, the milestone retains the full uploaded payload beside every emitted event. A production Bronze store should instead retain the payload once and reference byte offsets or record identifiers.

## Field lineage

Every mapping records `sourcePath`, `targetPath`, `transform`, `confidence` and the observed source value. This allows an analyst to answer why `src_endpoint.ip`, `severity_id` or any other mapped field has its value.

## Integrity boundary

The server hashes a stable serialization of the normalized event and links each event to the preceding event fingerprint. OCSF 1.9 `attestation_list`, `chain_uid` and `prev_event` fields carry this relationship. Any changed record or broken predecessor link fails verification.

This is tamper evidence, not non-repudiation. The demo has no private signing key or trust store. Production authenticity requires digital signatures and controlled key custody.
