# Varunetra Web Console

This directory contains the Next.js 16 SIH prototype for the Varunetra national weather intelligence platform.

## Commands

```bash
npm run dev    # local development
npm run lint   # application lint checks
npm run build  # production build and TypeScript validation
npm run start  # serve the production build
```

## Google Cloud Translation

Copy `.env.example` to `.env.local` and provide a server-only API key:

```bash
GOOGLE_TRANSLATE_API_KEY=your_restricted_key
```

Enable Cloud Translation API Basic (v2) for the key. The browser calls the local `/api/translate` route, so the key is never exposed to client code. English is the default; Hindi and Marathi are available from the Shadcn language menu. Bundled translations keep the demo functional when the external API is not configured.

## What is implemented

- India-first operational dashboard
- interactive incident map and event inspector
- event-type and location search filters
- animated report/verification trend chart
- explainable AI verification evidence
- human review actions
- source-connection controls
- responsive desktop, tablet, and mobile layouts
- Google Cloud-backed English, Hindi, and Marathi interface translation

The current data layer is intentionally simulated. See `../docs/architecture.md` for the production evolution path.
