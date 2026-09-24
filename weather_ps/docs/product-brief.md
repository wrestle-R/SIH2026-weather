# Product Brief — Varunetra

## One-line pitch

Varunetra turns noisy, duplicated, multi-source weather reports into a trusted national operating picture for faster decisions.

## SIH problem framing

Weather intelligence is fragmented across official APIs, satellite products, news, social media, public datasets, and citizen observations. The difficult part is not collection alone: operators must determine whether a report is current, local, unique, and trustworthy before acting on it.

Varunetra addresses this with one pipeline:

1. Ingest heterogeneous official and public signals.
2. Normalize time, coordinates, administrative boundaries, event type, and media metadata.
3. Cluster near-duplicate reports into one event thread.
4. Score trust using source history, spatio-temporal agreement, media checks, and proximity to official sensors.
5. Route uncertain or high-impact incidents to a human verification queue.
6. Publish verified events to dashboards, analytics, CAP-compatible alerts, and downstream systems.

## Primary users

- National and state emergency operations centres
- India Meteorological Department and disaster-management analysts
- District administrators and first-response teams
- Newsrooms and public-information officers
- Researchers studying extreme-weather patterns

## Demo value proposition

The prototype focuses on the moment a judge can understand quickly: a citizen flood report in Guwahati becomes an evidence-backed event after agreement with other reports and trusted telemetry. The same screen shows raw signal volume, duplicate reduction, confidence, human review, and source health.

## Differentiators

- India-specific operational geography and source plan
- evidence-backed confidence instead of an unexplained “AI verified” label
- event-level deduplication rather than simple text matching
- human-in-the-loop workflow for consequential decisions
- interoperable alert direction through NDMA SACHET/CAP patterns
- multilingual-ready design for national and district use

## Success metrics

- median time from first report to confirmed incident
- duplicate reports removed per event
- precision/recall by weather-event class
- calibration error of verification confidence
- percentage of high-impact incidents receiving human review
- source freshness, latency, and availability
- analyst time saved per shift

