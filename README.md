# UdaraKita

A lightweight Malaysia Air Quality Checker built with React, Vite, Tailwind CSS, and Lucide React. This delivery covers **Milestones 1–3**: setup, real data access, a responsive station dashboard, combined filters, manual refresh/retry, and stale-data handling.

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

## Installable app (PWA)

Production builds use [Vite PWA](https://vite-pwa-org.netlify.app/guide/) to generate a manifest and service worker. The app includes standalone display, dark theme colours, 192px/512px icons, a maskable icon, and an Apple touch icon using the existing logo. Service workers require HTTPS (or localhost); they are disabled during `npm run dev`. Test with `npm run build` and `npm run preview`.

- Chrome/Edge: open **Settings → Install the app** and use **Install UdaraKita** when offered, or use the browser's install menu.
- iPhone/iPad: open in Safari, tap **Share → Add to Home Screen**.
- Visit online once and allow the service worker to finish installing before testing offline. The app shell opens offline after that. A successful readings request saves a validated snapshot on the device. If a later network request fails, the app shows those readings with an explicit saved-data notice, saved time in MYT, and original observation times. With no saved readings, it asks you to connect. Reconnect and press Refresh to retrieve current data; it does not poll automatically.
- API responses are not cached by the service worker. HTTP errors and cancelled requests keep their existing handling. Device storage is best effort; if it is blocked, full, or cleared, live access still works but offline readings may be unavailable. External badges and source links need a connection.
- When an updated service worker is ready, **Update app** reloads into it; **Later** lets you continue. Netlify serves the worker and manifest with revalidation headers.
- In the installed PWA on phones (below 768px), the fixed bottom navigation offers **Home**, **Filters**, **Places**, and **Settings**, with active-page highlighting and room for the device’s home indicator. Larger screens use header navigation. The bottom bar is hidden in regular browser tabs; the header Settings link remains available for installation.

PWA validation: production build and all 22 Node tests pass. Headless Chrome with a temporary regular profile reported no manifest or installability errors. Browser-only station fixtures verified offline shell reloads, saved readings, the no-snapshot message, and recovery after reconnecting. No page errors or horizontal overflow at 375px, 800px, or 1280px. Physical-device installation and deployed HTTPS verification remain pending. Dependency audit currently reports six advisories (two low, four moderate) through the PWA build tooling; no forced dependency downgrades were applied.


## Mobile navigation and Settings

- Pages use `#home`, `#filters`, `#places`, and `#settings`, so browser Back/Forward and direct links work without server rewrites. The air-quality request and search/state selections survive page changes; navigation does not request another readings snapshot.
- Home retains the dashboard. Filters provides a dedicated search and state-filter view with the same selections and result handling.
- Places requests device location only after **Use my location**. The provider’s `latitude` and `longitude` fields are used to rank up to six nearby stations by straight-line distance. Stations without valid coordinates are excluded, and missing data stays unavailable. GPS coordinates remain in memory, are not sent to our server, and can be forgotten from Settings. Denied permission, unsupported location, and timeouts provide a Filters alternative. HTTPS (or localhost) and device permission are required; see [Geolocation documentation](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition). Station fields were checked against the [provider API](https://hazemonitor.com/openapi.json).
- Settings contains app installation (including iOS/browser instructions and installed-state feedback), clearing saved offline readings, and forgetting the current GPS position. Clearing saved readings affects device storage; the current in-memory readings remain visible and the next successful refresh saves a new snapshot.
- **Alert location**, **Saved locations**, **Notifications & alerts**, **Theme**, **Language**, and **About the data** are visible placeholders labelled **Coming later**. They do not request notification permission, save places, send alerts, or change preferences yet.
- Browser validation used station fixtures and simulated GPS: navigation/history, preserved filters, no extra readings requests on navigation, nearest-station ordering, permission denial, timeout, cancellation after forgetting, installation prompt dismissal, clearing offline data, and service-worker offline navigation passed. No page errors or horizontal overflow at 320/375/767/800/1280px. Real phone GPS and home-screen checks remain pending.

## Files and folders

- `package.json`, `package-lock.json`: scripts and reproducible React, Vite, Tailwind, and Lucide dependencies.
- `vite.config.js`: React and Tailwind Vite plugins, plus a local bridge to the Netlify Function for development and preview.
- `index.html`, `public/favicon.svg`: document metadata and a small local logo asset.
- `src/main.jsx`: React entry point.
- `src/App.jsx`: dashboard composition, combined filter state, result counts, and loading/error/empty/freshness feedback. The dark canvas, rounded panels, and pastel accents take their visual cue from the supplied screenshot. No sample readings are shipped.
- `src/index.css`: Tailwind import, theme tokens, base styling, keyboard focus, and reduced-motion support. Tailwind v4 uses the Vite plugin; a separate Tailwind/PostCSS config is unnecessary.
- `src/services/hazeApi.js`: centralized native fetch, response validation, cache-lifetime parsing, and errors carrying Retry-After deadlines.
- `src/hooks/useAirQuality.js`: initial fetch with abort cleanup, manual refresh/retry, in-flight request guard, cooldown timer, and preservation of the last successful snapshot after refresh failure. The timer updates labels only and never polls.
- `src/utils/stations.js`: distinct state options, combined case-insensitive station/state search, and freshness checks.
- `src/utils/airQuality.js`: safe numeric/text handling, observation formatting in `Asia/Kuala_Lumpur`, category mapping, and latest valid station observation selection. Provider category labels take precedence; absent labels fall back to Malaysian IPU bands. Unknown provider labels use a neutral colour.
- `src/components/Header.jsx`: wordmark, logo, and product subtitle.
- `src/components/SummaryStrip.jsx`: returned station count and latest valid station observation, calculated from station timestamps rather than fetch time.
- `src/components/StationCard.jsx`: station name, state, API/IPU, category text/colour, and observation time. Unknown readings remain unavailable.
- `src/components/SearchBar.jsx`, `src/components/StateFilter.jsx`: labelled, keyboard-accessible search and state controls operating on the loaded snapshot.
- `src/components/Footer.jsx`: required attribution, authority disclaimer, and source links.
- The station grid uses one column on mobile, two from 768px, and three from 1024px. A keyboard skip link leads directly to the readings.
- `netlify/functions/air-quality.mjs`: fixed-upstream, read-only CORS fallback; validates upstream JSON, preserves cache policy, coalesces concurrent requests, caches within each function instance, observes `Retry-After`, and times out upstream requests.
- `netlify.toml`: build command, `dist` publish directory, Node version, and functions directory.
- `tests/air-quality.test.js`: API-contract, missing-reading, date, cache, retry, category-boundary, provider-precedence, and latest-observation tests. Test fixtures are never used as production fallbacks.
- `PRD.md`: product requirements and milestone scope.

## API verification

Sources: [developer guide](https://hazemonitor.com/developers) and [OpenAPI schema](https://hazemonitor.com/openapi.json).

The live `GET https://hazemonitor.com/api/air-quality` response was inspected during implementation. It returned a `stations` array with station `id`, `name`, `state`, numeric/nullable `api`, `category`, and nullable `observedAt`. Response-level `fetchedAt` is not used as observation time. Values are Malaysian API/IPU, not US AQI or PM2.5 concentrations.

The direct response omitted `Access-Control-Allow-Origin` when sent a local browser Origin. Accordingly, the frontend uses the PRD-approved same-origin `/.netlify/functions/air-quality` fallback. No public CORS bypass is used. Upstream policy at verification was `public, s-maxage=300, stale-while-revalidate=86400`. Manual refresh waits for the published cache lifetime (s-maxage preferred, then max-age; five minutes if absent). Retry uses Retry-After as seconds or an HTTP date, with a 30-second fallback for other errors. There is no automatic polling. Function memory caching is per instance; Netlify's shared caching follows the returned upstream cache policy.

## Netlify readiness

Connect this repository in Netlify. The checked-in configuration builds with `npm run build`, publishes `dist`, and deploys the function. No SPA rewrite or credentials are required. Actual deployment and verification on a Netlify domain belong to Milestone 4 and are not completed here.

## Deferred milestones

- Milestone 4: GitHub/Netlify publishing and deployed-domain verification.

The dashboard handles null values, formats observation times, and displays provider categories with text and colour. Search and state filtering operate together without additional API requests. No-match results offer a Clear filters button; provider-empty results have a separate message. No charts, maps, or other later-scope features are included.

## Milestone 2 validation

- `npm test`: nine tests passed, including all IPU category boundaries and latest-observation selection.
- `npm run build`: production bundle built successfully.
- Installed Chrome rendered 68 real stations through the same-origin function; a valid station's name, state, IPU, provider category, and MYT observation time were checked against the API response.
- Browser checks confirmed one/two/three columns at 375/800/1280px with no horizontal overflow or page errors, plus working keyboard skip navigation.
- Browser-only fixtures verified zero and unavailable readings, absent category fallback, and provider category precedence. Fixtures are not included in the application.

Netlify-domain validation remains pending Milestone 4.


## Milestone 3 behaviour

- The summary always describes the complete returned snapshot; the result count describes the current filtered subset.
- Refresh and Retry are disabled while a request is running or the cache/retry cooldown is active. A visible countdown explains availability. Existing readings remain visible during refresh and after failure, with an explicit failure notice.
- Station readings older than three hours display “Data may be outdated.” Three hours is an application threshold for the generally hourly feed, not an official provider guarantee. The page also warns if any returned station is old or the provider flags the snapshot as stale. Unknown timestamps are identified as having unverifiable freshness.
- Time passing updates freshness and countdown labels without making API requests.
- Zero IPU remains a valid reading; missing/null IPU stays Unavailable.
- Deployment, GitHub push, and Netlify-domain verification remain Milestone 4.

## Milestone 3 validation

- `npm test`: all 15 tests passed, covering combined filters, distinct state options, freshness thresholds, cache guidance, and Retry-After parsing alongside previous checks.
- `npm run build`: production build passed.
- Chrome loaded 68 real stations; case-insensitive combined filtering, no-match feedback, and Clear filters worked with only the initial API request.
- Browser-only fixtures and a simulated clock verified successful retry after failure, Retry-After and cache cooldowns, disabled in-flight controls, retention of prior readings after refresh failure, stale and null values, empty provider responses, and absence of automatic polling.
- No page errors or horizontal overflow at 375px, 800px, or 1280px.
