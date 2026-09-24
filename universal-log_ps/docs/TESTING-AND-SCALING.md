# Testing, Benchmarking and Scale Claims

## Automated coverage

- Fixture tests cover CEF, LEEF, RFC 5424 Syslog, JSON, XML, CSV and key-value detection and normalization.
- Invariants assert exact evidence recovery, deterministic raw hashing, unmapped retention, lineage presence and OCSF metadata.
- Integrity tests cover valid chains, predecessor links and modified-event failure.
- Manifest tests cover config-only mapping, unsafe regular-expression rejection and target allowlisting.
- Playwright covers the primary jury normalization and evidence-verification path plus mobile navigation.

## Required release checks

Run type checking, ESLint, Vitest, a production build, browser tests, console inspection and an accessibility-focused UI review. Container verification must start the standalone image and call `/api/health` from outside the container.

## Honest performance method

The UI reports only timing from its current request and marks all seeded dashboard figures as demo data. A publishable throughput claim requires:

1. A fixed public corpus with event-size distribution and format mix.
2. Warm-up, sustained and burst stages with CPU, memory and latency percentiles.
3. Parser-only and end-to-end tests including durable storage and backpressure.
4. Failure-path measurements for malformed input and dead-letter handling.
5. Repetition on documented hardware with raw reports committed as artifacts.

The production target should be calculated from peak events per second, not daily averages alone. No billion-event claim is considered verified until the distributed pipeline exists and passes this method.
