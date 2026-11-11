# UdaraKita

A lightweight Malaysia Air Quality Checker built with React, Vite, Tailwind CSS, and Lucide React. 

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


## Saved locations and high-IPU alerts

- Save up to 20 monitoring stations from Home/Filters cards, GPS results, or Settings. Places shows saved stations without requiring GPS. Station IDs, names, states, alert settings, and a bounded notification history are stored on this device. GPS coordinates are not saved. Remove a location from its card or Settings; blocked storage reports a failure instead of claiming success.
- In Settings, enable **High-IPU alerts**, choose one station or all saved locations, and select **101+**, **201+**, or **301+**. The default 101 threshold follows the [DOE unhealthy band](https://www.doe.gov.my/wp-content/uploads/2021/10/General-Information-of-Air-Pollutant-Index.pdf). Alerts are off by default.
- While alerts are enabled and there are saved stations, readings refresh only while the app is open, visible, and online. Refresh respects provider cache/retry deadlines, with at least 60 seconds between automatic attempts. Returning to the tab or reconnecting resumes the schedule. Disabling alerts or removing all saved stations stops automatic checks.
- High-IPU banners work without notification permission. Device notifications require an explicit **Enable device notifications** tap and browser permission. A test button checks delivery. Production uses service-worker notifications, with a desktop fallback where available; clicking a notification opens Places. See [Notifications API guidance](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API/Using_the_Notifications_API).
- Only saved/watched stations with fresh, valid, non-future readings can trigger alerts. Offline snapshots, provider-stale data, readings over three hours old, unknown times, and missing IPU values are excluded. Each station/observation/threshold combination notifies once, with persisted history (up to 100 entries) and cross-tab locking where supported. A new high observation can notify again.
- This is foreground monitoring, not closed-app/background push or an emergency warning service. No server scheduler, push subscription, or background notification delivery is configured. iOS notification permissions must be tested in an installed home-screen app. OS delivery is outside the app’s control.

## API verification

Sources: [developer guide](https://hazemonitor.com/developers) and [OpenAPI schema](https://hazemonitor.com/openapi.json).

The live `GET https://hazemonitor.com/api/air-quality` response was inspected during implementation. It returned a `stations` array with station `id`, `name`, `state`, numeric/nullable `api`, `category`, and nullable `observedAt`. Response-level `fetchedAt` is not used as observation time. Values are Malaysian API/IPU, not US AQI or PM2.5 concentrations.

The direct response omitted `Access-Control-Allow-Origin` when sent a local browser Origin. Accordingly, the frontend uses the PRD-approved same-origin `/.netlify/functions/air-quality` fallback. No public CORS bypass is used. Upstream policy at verification was `public, s-maxage=300, stale-while-revalidate=86400`. Manual refresh waits for the published cache lifetime (s-maxage preferred, then max-age; five minutes if absent). Retry uses Retry-After as seconds or an HTTP date, with a 30-second fallback for other errors. Without enabled saved-location alerts, there is no automatic polling. Function memory caching is per instance; Netlify's shared caching follows the returned upstream cache policy.
