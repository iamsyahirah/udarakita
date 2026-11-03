# UdaraKita

A lightweight Malaysia Air Quality Checker built with React, Vite, Tailwind CSS, and Lucide React. This delivery covers **Milestone 1 only**: setup, data access, and a minimal real station list.

## Run locally

Use Node.js 22.12+ (Node 22 LTS recommended).

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. No API key or environment variable is needed. Internet access is required for station readings. The development server runs the same small API handler used by Netlify; no separate backend process is needed.

```sh
npm test
npm run build
npm run preview
```

`npm run preview` serves the production bundle and the local API handler. Deploy the project through Netlify rather than uploading only `dist` to a generic static host: the serverless function is required for API access.

## Files and folders

- `package.json`, `package-lock.json`: scripts and reproducible React, Vite, Tailwind, and Lucide dependencies.
- `vite.config.js`: React and Tailwind Vite plugins, plus a local bridge to the Netlify Function for development and preview.
- `index.html`, `public/favicon.svg`: document metadata and a small local logo asset.
- `src/main.jsx`: React entry point.
- `src/App.jsx`: one initial request with abort cleanup; a minimal station list, loading message, failure message, and unavailable values. The dark canvas, rounded panel, and lime accents take their visual cue from the supplied screenshot. No sample readings are shipped.
- `src/index.css`: Tailwind import, theme tokens, base styling, keyboard focus, and reduced-motion support. Tailwind v4 uses the Vite plugin; a separate Tailwind/PostCSS config is unnecessary.
- `src/services/hazeApi.js`: centralized native fetch, response validation, and readable request errors.
- `src/utils/airQuality.js`: safe numeric/text handling and observation date formatting in `Asia/Kuala_Lumpur`. Category colour mapping is deferred to Milestone 2.
- `src/components/`: reserved for components introduced in later milestones; `.gitkeep` retains the empty folder. Header, cards, filters, and footer components are intentionally not scaffolded as nonfunctional placeholders.
- `netlify/functions/air-quality.mjs`: fixed-upstream, read-only CORS fallback; validates upstream JSON, preserves cache policy, coalesces concurrent requests, caches within each function instance, observes `Retry-After`, and times out upstream requests.
- `netlify.toml`: build command, `dist` publish directory, Node version, and functions directory.
- `tests/air-quality.test.js`: API-contract, missing-reading, date, cache, and retry tests. Test fixtures are never used as production fallbacks.
- `PRD.md`: product requirements and milestone scope.

## API verification

Sources: [developer guide](https://hazemonitor.com/developers) and [OpenAPI schema](https://hazemonitor.com/openapi.json).

The live `GET https://hazemonitor.com/api/air-quality` response was inspected during implementation. It returned a `stations` array with station `id`, `name`, `state`, numeric/nullable `api`, `category`, and nullable `observedAt`. Response-level `fetchedAt` is not used as observation time. Values are Malaysian API/IPU, not US AQI or PM2.5 concentrations.

The direct response omitted `Access-Control-Allow-Origin` when sent a local browser Origin. Accordingly, the frontend uses the PRD-approved same-origin `/.netlify/functions/air-quality` fallback. No public CORS bypass is used. Upstream policy at verification was `public, s-maxage=300, stale-while-revalidate=86400`. There is no automatic polling or refresh control in Milestone 1. Function memory caching is per instance; Netlify's shared caching follows the returned upstream cache policy.

## Netlify readiness

Connect this repository in Netlify. The checked-in configuration builds with `npm run build`, publishes `dist`, and deploys the function. No SPA rewrite or credentials are required. Actual deployment and verification on a Netlify domain belong to Milestone 4 and are not completed here.

## Deferred milestones

- Milestone 2: dashboard components, summary strip, category colour indicators, and full responsive card layout.
- Milestone 3: combined search/state filters, manual refresh/retry controls, and complete stale-data handling.
- Milestone 4: GitHub/Netlify publishing and deployed-domain verification.

The initial list already handles null values and formats observation times so real data can be inspected safely. It displays provider categories without implementing category colour bands, health advice, fabricated trends, or later-milestone interactions.
