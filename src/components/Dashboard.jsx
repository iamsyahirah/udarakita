import { useTranslation } from '../contexts/AppPreferences.jsx'
import { CircleAlert, LoaderCircle, RefreshCw, Wind } from 'lucide-react'
import SummaryStrip from './SummaryStrip.jsx'
import StationCard from './StationCard.jsx'
import SearchBar from './SearchBar.jsx'
import StateFilter from './StateFilter.jsx'
import { filterStations, stationStates, freshnessMessage } from '../utils/stations.js'
import { displayText } from '../utils/airQuality.js'

export default function Dashboard({ airQuality, query, setQuery, state, setState, savedPlaces, filtersPage = false }) {
  const { t, locale } = useTranslation()
  const { result, error, loading, load, now, notice, waitSeconds } = airQuality
  const stations = result?.stations ?? []
  const filtered = filterStations(stations, query, state)
  const freshness = freshnessMessage(result, now)
  const cooldown = waitSeconds ? t('Available in {time}', { time: `${Math.floor(waitSeconds / 60)}:${String(waitSeconds % 60).padStart(2, '0')}` }) : ''
  const resetFilters = () => { setQuery(''); setState('') }

  return (
    <>
        {filtersPage ? <div className="page-intro"><p className="eyebrow">{t("Make it local")}</p><h1 className="page-title">{t("Filters")}</h1><p className="page-description">{t("Find a station by name or narrow your view by state.")}</p></div> : <div className="py-12 sm:py-16">
          <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accent"><Wind size={16} aria-hidden="true" /> {t("A little clarity in the air")}</p>
          <h1 className="text-5xl leading-[1.08] font-medium tracking-tight sm:text-7xl">{t("Our air.")}<br /><span className="text-accent">{t("At a glance.")}</span></h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted">{t("Check the latest available air quality readings across Malaysia.")}</p>
        </div>}

        {!filtersPage && result && <SummaryStrip stations={result.stations} />}

        <section id="station-readings" aria-labelledby="stations-heading" tabIndex={-1}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">{t("Across Malaysia")}</p>
              <h2 id="stations-heading" className="text-2xl font-medium tracking-tight">{t("Station readings")}</h2>
            </div>
            <p className="text-xs text-muted">{t("Malaysian Air Pollutant Index · API / IPU")}</p>
          </div>
          <div id="station-controls" className="mb-3 flex scroll-mt-5 flex-col gap-4 sm:flex-row sm:items-end">
            <SearchBar value={query} onChange={setQuery} />
            <StateFilter states={stationStates(stations)} value={state} onChange={setState} />
            <button type="button" onClick={load} disabled={loading || waitSeconds > 0} aria-describedby="refresh-guidance" className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-lime px-5 py-3.5 text-sm font-medium text-ink">
              <RefreshCw size={16} aria-hidden="true" className={loading ? 'animate-spin' : ''} />{loading ? t("Refreshing…") : error ? t("Retry") : t("Refresh")}
            </button>
          </div>
          <p id="refresh-guidance" className="mb-6 text-xs leading-5 text-muted">{cooldown || (loading ? t("Requesting the latest available snapshot…") : t("Refresh requests a new snapshot when the provider cache allows."))} {waitSeconds > 0 && (error ? t("Retry is temporarily paused.") : t("Readings are cached to avoid excessive requests."))}</p>
          {!result && loading && <p role="status" className="flex items-center gap-3 rounded-[26px] bg-panel p-8 text-sm text-muted"><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> {t("Loading station readings…")}</p>}
          {error && <div role="alert" className="mb-5 flex gap-3 rounded-2xl bg-warning-surface p-5 text-sm leading-6 text-warning"><CircleAlert className="shrink-0" size={20} aria-hidden="true" /><p>{t(error)}{result && " " + t("Showing the previously loaded snapshot; observations have not been updated.")}</p></div>}
          {result?.offline && <p role="status" className="mb-5 rounded-2xl bg-warning-surface p-5 text-sm leading-6 text-warning">{t("Connection unavailable. Showing saved readings from")} {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(result.savedAt)} {t("MYT. These are not live readings. Go online and refresh to update them.")}</p>}
          {freshness && <p role="status" className="mb-5 rounded-2xl bg-warning-surface p-5 text-sm leading-6 text-warning">{t(freshness)}</p>}
          {result && <>
            <p role="status" className="mb-5 text-sm text-muted">{t('Showing {shown} of {total} returned stations', { shown: filtered.length, total: stations.length })}</p>
            {!error && <p className="sr-only" role="status">{loading ? t("Refreshing station readings.") : notice}</p>}
            {stations.length === 0 ? <p className="rounded-[26px] bg-panel p-8 text-sm text-muted">{t("Haze Monitor returned no stations. Try refreshing when available.")}</p> : filtered.length === 0 ? <div className="rounded-[26px] bg-panel p-8">
              <h3 className="font-medium">{t("No matching stations")}</h3>
              <p className="mt-2 text-sm text-muted">{t("Try another station name or state, or clear your filters.")}</p>
              <button type="button" onClick={resetFilters} className="mt-5 rounded-xl bg-lime px-4 py-3 text-sm font-medium text-ink">{t("Clear filters")}</button>
            </div> : <ul aria-busy={loading} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {filtered.map((station, index) => (
                <li key={`${displayText(station.id, 'station')}-${index}`} className="min-w-0"><StationCard station={station} now={now} savedPlaces={savedPlaces} /></li>
              ))}
            </ul>}
          </>}

        </section>
    </>
  )
}
