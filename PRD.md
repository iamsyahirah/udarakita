# Product Requirements Document (PRD)

## UdaraKita — Malaysia Air Quality Checker

**Version:** 1.0 (MVP)  
**Date:** 4 November 2026  
**Platform:** Responsive web application  
**Stack:** React, Vite, Tailwind CSS, Lucide React  
**Data source:** Haze Monitor public API  
**Deployment:** Netlify  
**Backend/database/authentication:** None for MVP

---

## 1. Product Overview

UdaraKita is a lightweight web application for checking the **latest available Malaysian Air Pollutant Index (API/IPU)** readings from monitoring stations. Users can search stations or filter by state and quickly understand the reported air quality category.

This is a **single-page, public, read-only** project designed to be fast to build, mobile-friendly, and easy to deploy on Netlify.

**Important distinction:** Display the official Malaysian API/IPU supplied for stations. Do not relabel the values as US AQI, infer local readings from a user's address, or claim the data is a forecast.

## 2. Goals and Success Criteria

### Goals
- Show up-to-date *available* readings for Malaysian monitoring stations.
- Help visitors find a specific station or filter stations by state.
- Communicate air-quality categories clearly with text and colour.
- Deploy a reliable, accessible single-page React app on Netlify.
- Showcase external REST API integration for a developer portfolio.

### MVP success criteria
- The page displays live API data when available, not hard-coded sample readings.
- Search and state filtering both work, including together.
- Each displayed station shows its name, state, IPU/API value, category, and observation time.
- Loading, unavailable, stale, and API error states are understandable.
- The project passes `npm run build` and runs after Netlify deployment.
- The mobile layout works at a 375px viewport without horizontal scrolling.

## 3. Target Users

- People in Malaysia checking air quality before daily activities.
- Students and families monitoring pollution conditions in their area.
- Visitors looking for a quick, simple air quality snapshot.

## 4. MVP Scope

### Included features (P0)

**F01 — National station overview**
- Fetch `GET https://hazemonitor.com/api/air-quality`.
- Show a responsive list/grid of monitoring stations.
- Show total stations returned (label as returned/reporting stations, not a promise of all active stations).

**F02 — Search stations**
- Search by station name and state with a client-side, case-insensitive text filter.
- Show a clear message if no stations match.
- No dedicated geocoding call required.

**F03 — Filter by state**
- Dropdown populated from distinct state names returned by the API.
- Include “All states.”
- Search and state filter can operate together.

**F04 — Station card**
- Display station name, state, numeric API/IPU or `Unavailable`, category, and observation date/time.
- Show the observation time in `Asia/Kuala_Lumpur`, not a fabricated “live now” badge.
- Use both a coloured indicator and a text label for accessibility.

**F05 — Refresh**
- Provide a manual refresh button.
- Disable while a request is in progress and show visible feedback.
- Do not implement frequent automatic polling; follow response `Cache-Control` guidance and avoid requests more often than the API's published cache lifetime.

**F06 — Request states**
- Initial loading skeleton or text.
- Friendly failure state with retry control.
- Empty results state after filtering.
- Missing/null station reading state (do not display `0` for unavailable data).
- Show the most recent observation timestamp and a “data may be outdated” message when timestamps are unexpectedly old or the API indicates stale data. Do not conceal stale data as current.

**F07 — Footer and attribution**
- State “Data provided by Haze Monitor; Malaysian observations sourced from the Department of Environment (DOE/JAS).”
- Link to https://hazemonitor.com/developers and https://www.doe.gov.my/.
- Include “For official public-health advice, consult relevant Malaysian authorities.”

### Out of scope for MVP
- User accounts or login.
- Database, Supabase, MySQL, Laravel or Express server.
- Maps, geolocation, GPS, or location permissions.
- Historical charts, forecasts or weather integration.
- Push notifications and automated alerts.
- Admin panel, data editing, or a paid subscription.

## 5. Main User Flow

1. User opens the UdaraKita homepage.
2. App fetches and displays the latest available station readings.
3. User optionally types a station/city keyword and/or selects a state.
4. Matching station cards update immediately.
5. User reads the API/IPU value, category, and observation time.
6. User can press Refresh to request a newer snapshot, subject to API caching.

## 6. UI/UX Requirements

**Visual direction:** Clean, bright, contemporary environmental dashboard. Use plenty of whitespace, rounded cards, accessible typography and soft background colours; avoid a generic admin dashboard look.

### Page layout (single page)
1. **Header:** UdaraKita logo/wordmark, “Malaysia Air Quality Checker”.
2. **Intro:** “Check the latest available air quality readings across Malaysia.”
3. **Summary strip:** Number of reporting stations and latest observation time (calculated from valid station timestamps).
4. **Controls:** Search input, state dropdown, Refresh button.
5. **Station grid:** Responsive cards with values and categorical labels.
6. **Footer:** Data attribution, disclaimer, source links.

### Responsive behaviour
- Mobile first; 1 column on small screens, 2 on medium screens, 3 on wide screens where appropriate.
- Controls stack on mobile and align horizontally on desktop.
- Maintain readable contrast and keyboard navigation.

### IPU categories
Use the provider's `category` when it is present. If a valid numeric IPU exists but the category is absent, use Malaysia's conventional bands:

| IPU | Label | Suggested colour |
|---|---|---|
| 0–50 | Good / Baik | Green |
| 51–100 | Moderate / Sederhana | Yellow |
| 101–200 | Unhealthy / Tidak Sihat | Orange |
| 201–300 | Very Unhealthy / Sangat Tidak Sihat | Red |
| 301+ | Hazardous / Berbahaya | Purple |

Do not treat null as zero. Use textual labels alongside colours. Keep category mapping in `src/utils/airQuality.js`.

## 7. Technical Requirements

### Technology choices
- React with Vite, JavaScript (not TypeScript for MVP).
- Tailwind CSS for layout and styling.
- Lucide React for icons.
- Native `fetch` with React hooks; no need for TanStack Query or Recharts in the MVP.
- No React Router required for the single-page version.

### API contract
- **Base URL:** `https://hazemonitor.com`
- **Endpoint:** `GET /api/air-quality`
- **Header:** `Accept: application/json`
- **Authentication:** None.
- The response includes a `stations` array; inspect the live response / OpenAPI schema before coding to confirm optional and nullable fields.
- Expected station fields used by UI include `id`, `name`, `state`, `api`, `category`, and `observedAt`.
- Do not confuse a response's fetch time with an observation's timestamp.

### API integration behaviour
- Centralize API requests in `src/services/hazeApi.js`.
- Use `AbortController` cleanup when appropriate.
- Validate that `stations` is an array before rendering.
- Safely handle non-200 responses, malformed JSON, missing properties and null readings.
- Render only API-derived readings; mock data may be used in tests but not as fallback production data.
- Respect `Cache-Control` and any `Retry-After` guidance; avoid load testing or high-frequency polling.
- Format times with `Intl.DateTimeFormat` and `timeZone: 'Asia/Kuala_Lumpur'`.

### Browser CORS contingency
1. **First choice:** fetch directly from React and verify in both local development and the deployed Netlify URL.
2. If browser CORS blocks requests, **do not** disable browser security or rely on a public CORS bypass service.
3. Add one small **Netlify Function** at `netlify/functions/air-quality.mjs` that fetches the upstream public API server-side and returns the JSON to the frontend at `/.netlify/functions/air-quality`.
4. Preserve sensible cache behaviour and avoid excessive upstream requests.
5. This serverless function is a fallback only; it does not need a database or dedicated server.

## 8. Project Structure

```text
udarakita/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── SearchBar.jsx
│   │   ├── StateFilter.jsx
│   │   ├── StationCard.jsx
│   │   └── Footer.jsx
│   ├── services/
│   │   └── hazeApi.js
│   ├── utils/
│   │   └── airQuality.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml
├── README.md
└── PRD.md
```

If a CORS fallback is necessary, add `netlify/functions/air-quality.mjs`.

## 9. Delivery Milestones

### Milestone 1 — React setup and data access
- Scaffold Vite React app.
- Install and configure Tailwind CSS and Lucide React.
- Create the API service.
- Verify actual response structure and browser access.
- Render a minimal station list.

**Acceptance:** Actual station data appears locally; errors are handled.

### Milestone 2 — Dashboard UI
- Build header, summary strip, station cards and footer.
- Add IPU category indicators and Kuala Lumpur time formatting.
- Make layout responsive.

**Acceptance:** At least one valid API station displays all required fields without mock data.

### Milestone 3 — Filters and resilience
- Add combined search + state dropdown.
- Add manual refresh, loading, empty, error and unavailable states.
- Handle stale timestamps.

**Acceptance:** Filtering works without extra API requests; retry works after failure.

### Milestone 4 — Deploy on Netlify
- Run production build.
- Push to GitHub.
- Import repository in Netlify.
- Confirm direct API calls work on the deployed domain; if blocked by CORS, implement the Netlify Function fallback and retest.
- Check on mobile and desktop.

**Acceptance:** Public Netlify site loads real station data and all MVP interactions work.

## 10. Netlify Configuration

Create a `netlify.toml` in the project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

Deploy by connecting your GitHub repository in Netlify. No environment variable is needed for direct public API access. If a future React Router setup introduces client-side paths, add an SPA rewrite then; it is not necessary for this single-page MVP.

## 11. Testing Checklist

- [ ] `npm run dev` starts successfully.
- [ ] `npm run build` completes successfully.
- [ ] Response is read from the real Haze Monitor API.
- [ ] Station fields are correct and missing fields do not crash the page.
- [ ] Zero is never substituted for unknown IPU values.
- [ ] Search is case-insensitive and filters station names/states.
- [ ] State dropdown filters the same dataset.
- [ ] Search + dropdown work together.
- [ ] Empty results have a useful message.
- [ ] API errors have Retry and do not show made-up readings.
- [ ] Observation timestamps display in Malaysia time.
- [ ] Refresh does not spam the API.
- [ ] All interactive controls work with keyboard navigation.
- [ ] 375px mobile layout has no horizontal overflow.
- [ ] Netlify deployment loads and fetches data successfully.

## 12. Future Enhancements (Not MVP)

- Historical IPU chart (Haze Monitor history endpoint).
- Favourite stations saved to `localStorage`.
- Bilingual English/Bahasa Melayu toggle.
- Simple station comparison.
- Map view.

## 13. External References

- Haze Monitor API docs: https://hazemonitor.com/developers
- Haze Monitor OpenAPI: https://hazemonitor.com/openapi.json
- Netlify Vite deployment: https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/
- Netlify Functions docs: https://docs.netlify.com/build/functions/get-started/

## 14. Instructions for Codex

Build this project **incrementally** and prioritise simplicity. Start with Milestone 1. Do not add a database, authentication, maps, charts, a second backend, or features outside this PRD. Verify the live API response schema and CORS behaviour before implementing UI assumptions. Keep components small and explain significant file changes. Run the build after each milestone and fix errors before proceeding. Use real data in production, and only introduce a Netlify Function if browser CORS requires it.
