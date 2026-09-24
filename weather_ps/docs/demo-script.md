# SIH Demo Script — Varunetra

## Recommended 4-minute flow

### 0:00–0:35 — Establish the problem

“During severe weather, the same incident arrives through official warnings, gauges, posts, videos, and citizen calls. Operators lose time separating real events from duplicates and misleading media. Varunetra turns that noise into one evidence-backed national picture.”

Start on **Command overview** and point to the four top metrics: active events, report scale, verification rate, and duplicates merged.

### 0:35–1:35 — Show event discovery

Open **Live event stream**, use the event-type filter, and select the Guwahati flood marker. Explain that the platform preserves the original source, extracts time/location, clusters matching reports, and displays the evidence behind the confidence score.

Search for “Mumbai” to demonstrate location retrieval, then clear the query.

### 1:35–2:25 — Explain the intelligence pipeline

Open **Pipeline health**. Walk through ingestion, normalization, AI verification, and indexing. Emphasize that the model score is explainable and policy-controlled, then use the retry action to demonstrate recoverable operations.

Open **Analytics** and use the 12-hour chart to show that the system distinguishes report volume from verified-event volume.

### 2:25–3:15 — Demonstrate human oversight

Open **Verification queue**. Approve the Dehradun report and flag the recycled Puri cyclone video. Explain that high-impact or uncertain reports are always routed to an authorized analyst and every action is audited.

### 3:15–3:45 — Show national readiness

Open **Source registry** to show IMD, MOSDAC, NDMA SACHET, citizen reports, and public signals. Toggle a public source, test the connectors, and explain that official warnings remain authoritative. Finish in **Alert centre** by generating a citizen-facing advisory preview.

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
