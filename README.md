# UdaraKita

A lightweight Malaysia Air Quality Checker built with React, Vite, Tailwind CSS, and Lucide React. This delivery covers **Milestones 1 and 2**: setup, real data access, and a responsive station dashboard.

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
- `src/App.jsx`: one initial request with abort cleanup, dashboard composition, and existing loading/failure states. The dark canvas, rounded panels, and pastel accents take their visual cue from the supplied screenshot. No sample readings are shipped.
- `src/index.css`: Tailwind import, theme tokens, base styling, keyboard focus, and reduced-motion support. Tailwind v4 uses the Vite plugin; a separate Tailwind/PostCSS config is unnecessary.
- `src/services/hazeApi.js`: centralized native fetch, response validation, and readable request errors.
- `src/utils/airQuality.js`: safe numeric/text handling, observation formatting in `Asia/Kuala_Lumpur`, category mapping, and latest valid station observation selection. Provider category labels take precedence; absent labels fall back to Malaysian IPU bands. Unknown provider labels use a neutral colour.
- `src/components/Header.jsx`: wordmark, logo, and product subtitle.
- `src/components/SummaryStrip.jsx`: returned station count and latest valid station observation, calculated from station timestamps rather than fetch time.
- `src/components/StationCard.jsx`: station name, state, API/IPU, category text/colour, and observation time. Unknown readings remain unavailable.
- `src/components/Footer.jsx`: required attribution, authority disclaimer, and source links.
- The station grid uses one column on mobile, two from 768px, and three from 1024px. A keyboard skip link leads directly to the readings.
- `netlify/functions/air-quality.mjs`: fixed-upstream, read-only CORS fallback; validates upstream JSON, preserves cache policy, coalesces concurrent requests, caches within each function instance, observes `Retry-After`, and times out upstream requests.
- `netlify.toml`: build command, `dist` publish directory, Node version, and functions directory.
- `tests/air-quality.test.js`: API-contract, missing-reading, date, cache, retry, category-boundary, provider-precedence, and latest-observation tests. Test fixtures are never used as production fallbacks.
- `PRD.md`: product requirements and milestone scope.

## API verification

Sources: [developer guide](https://hazemonitor.com/developers) and [OpenAPI schema](https://hazemonitor.com/openapi.json).

The live `GET https://hazemonitor.com/api/air-quality` response was inspected during implementation. It returned a `stations` array with station `id`, `name`, `state`, numeric/nullable `api`, `category`, and nullable `observedAt`. Response-level `fetchedAt` is not used as observation time. Values are Malaysian API/IPU, not US AQI or PM2.5 concentrations.

The direct response omitted `Access-Control-Allow-Origin` when sent a local browser Origin. Accordingly, the frontend uses the PRD-approved same-origin `/.netlify/functions/air-quality` fallback. No public CORS bypass is used. Upstream policy at verification was `public, s-maxage=300, stale-while-revalidate=86400`. There is no automatic polling or refresh control in the current milestone. Function memory caching is per instance; Netlify's shared caching follows the returned upstream cache policy.

## Netlify readiness

Connect this repository in Netlify. The checked-in configuration builds with `npm run build`, publishes `dist`, and deploys the function. No SPA rewrite or credentials are required. Actual deployment and verification on a Netlify domain belong to Milestone 4 and are not completed here.

## Deferred milestones

- Milestone 3: combined search/state filters, manual refresh/retry controls, and complete stale-data handling.
- Milestone 4: GitHub/Netlify publishing and deployed-domain verification.

The dashboard handles null values, formats observation times, and displays provider categories with text and colour. Search, state filtering, manual refresh/retry, and age-based stale detection remain deferred to Milestone 3. No charts, maps, or other later-scope features are included.

## Milestone 2 validation

- `npm test`: nine tests passed, including all IPU category boundaries and latest-observation selection.
- `npm run build`: production bundle built successfully.
- Installed Chrome rendered 68 real stations through the same-origin function; a valid station's name, state, IPU, provider category, and MYT observation time were checked against the API response.
- Browser checks confirmed one/two/three columns at 375/800/1280px with no horizontal overflow or page errors, plus working keyboard skip navigation.
- Browser-only fixtures verified zero and unavailable readings, absent category fallback, and provider category precedence. Fixtures are not included in the application.

Netlify-domain validation remains pending Milestone 4.
