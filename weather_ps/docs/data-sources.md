# India Data Source Plan — Varunetra

The prototype uses simulated data. These are the proposed production integrations, subject to each agency’s terms, access process, attribution requirements, and rate limits.

## Tier 1 — Authoritative sources

### India Meteorological Department (IMD)

The official IMD API documentation lists city forecasts, current weather, district and station nowcasts, district/state rainfall, district warnings, AWS/ARG data, basin quantitative precipitation forecasts, port warnings, and RSS feeds.

- API page: <https://mausam.imd.gov.in/responsive/apis.php>
- API documentation: <https://mausam.imd.gov.in/imd_latest/contents/api.pdf>

Production note: obtain authorized access where required, attribute IMD, and cache responsibly during peak weather events.

### NDMA SACHET / Common Alerting Protocol

SACHET is NDMA’s pan-India, CAP-based geo-targeted alert platform. It aggregates warnings from authorized agencies and exposes alert information through multiple channels, including RSS/CAP-oriented integration patterns.

- Portal: <https://sachet.ndma.gov.in/>
- CAP integration guide: <https://sachet.ndma.gov.in/docs/Integration_Guide_For_Agencies.pdf>

Production note: respect ETag-based caching and treat CAP records as authoritative alerts, not ordinary crowd reports.

### ISRO MOSDAC

MOSDAC provides meteorological and oceanographic satellite products, including satellite imagery, radar-oriented services, forecasts, lightning, heavy-rain, heat-wave, cyclone, and related products. GSMaP-ISRO offers gauge-adjusted precipitation data for the Indian subcontinent.

- Portal: <https://www.mosdac.gov.in/>
- GSMaP-ISRO rainfall: <https://www.mosdac.gov.in/gsmap-isro-rain>

Production note: satellite products may require account-based download and format-specific processing such as HDF5.

## Tier 2 — Additional trusted sources

- Central Water Commission telemetry and flood bulletins
- state disaster-management authorities
- airport METAR/SPECI observations
- air-quality and visibility networks where relevant to fog/smog
- data.gov.in datasets with explicit licences and update schedules
- trusted local news partners with provenance agreements

## Tier 3 — Public and citizen signals

- consented citizen reports submitted through a mobile/web form
- public social posts obtained only through compliant APIs
- newsroom reports and public web bulletins
- emergency helpline reports where an agency data-sharing agreement exists

These signals must be scored and corroborated. They must never silently override an official warning.

## Connector acceptance checklist

- lawful access and documented licence
- stable identifier and source timestamp
- replay/backfill method
- rate-limit and caching policy
- data-quality and freshness SLO
- clear attribution requirements
- incident contact for schema or availability changes

