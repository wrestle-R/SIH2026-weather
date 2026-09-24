# SIH Demo Script — Varunetra

## Recommended 4-minute flow

### 0:00–0:35 — Establish the problem

“During severe weather, the same incident arrives through official warnings, gauges, posts, videos, and citizen calls. Operators lose time separating real events from duplicates and misleading media. Varunetra turns that noise into one evidence-backed national picture.”

Point to the four top metrics: active events, report scale, verification rate, and duplicates merged.

### 0:35–1:35 — Show event discovery

Use the event-type filter and select the Guwahati flood marker. Explain that the panel preserves the original source, extracts time/location, clusters matching reports, and displays the evidence behind the confidence score.

Search for “Mumbai” to demonstrate location retrieval, then clear the query.

### 1:35–2:25 — Explain the intelligence pipeline

Scroll to “From noise to trust.” Walk through ingestion, deduplication, AI scoring, and verified events. Emphasize that the model score is explainable and policy-controlled.

Use the 12-hour chart to show that the system distinguishes report volume from verified-event volume.

### 2:25–3:15 — Demonstrate human oversight

Open the verification queue. Approve the Dehradun report and flag the recycled Puri cyclone video. Explain that high-impact or uncertain reports are always routed to an authorized analyst and every action is audited.

### 3:15–3:45 — Show national readiness

Point to the connected data fabric: IMD, MOSDAC, NDMA SACHET, citizen reports, and public signals. Toggle a public source to show connector control. Explain that official warnings remain authoritative.

### 3:45–4:00 — Close with impact

“Varunetra is not another weather app. It is the trust and coordination layer between raw reports and decisive response—built for India’s scale.”

## Likely judge questions

**Is the data live?**  
The UI currently uses a deterministic simulated dataset for a reliable demo. The production source contracts and connector plan are documented, including official IMD, MOSDAC, and SACHET interfaces.

**How do you detect fake reports?**  
A calibrated ensemble checks provenance, source history, spatio-temporal agreement, sensor proximity, media reuse, metadata, and cross-source consensus. Uncertain or high-impact records go to human review.

**How is this different from a forecast app?**  
It combines forecasts and official warnings with real-world impact reports, verifies them, removes duplicates, preserves provenance, and supports operational decisions.

**How will it scale?**  
The proposed architecture partitions events by geohash/time, processes them through a streaming backbone, stores geospatial state in PostGIS, and separates operational search from analytical workloads.

**What about privacy?**  
Citizen identifiers and precise locations are restricted, encrypted, consent-based, and coarsened for public use. Every verification decision retains an audit trail.
