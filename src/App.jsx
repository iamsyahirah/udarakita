import { useState } from 'react'
import { CircleAlert, LoaderCircle, RefreshCw, Wind } from 'lucide-react'
import Header from './components/Header.jsx'
import SummaryStrip from './components/SummaryStrip.jsx'
import StationCard from './components/StationCard.jsx'
import Footer from './components/Footer.jsx'
import SearchBar from './components/SearchBar.jsx'
import StateFilter from './components/StateFilter.jsx'
import useAirQuality from './hooks/useAirQuality.js'
import { filterStations, stationStates, freshnessMessage } from './utils/stations.js'
import { displayText } from './utils/airQuality.js'

export default function App() {
  const { result, error, loading, load, now, notice, waitSeconds } = useAirQuality()
  const [query, setQuery] = useState('')
  const [state, setState] = useState('')
  const stations = result?.stations ?? []
  const filtered = filterStations(stations, query, state)
  const freshness = freshnessMessage(result, now)
  const cooldown = waitSeconds ? `Available in ${Math.floor(waitSeconds / 60)}:${String(waitSeconds % 60).padStart(2, '0')}` : ''
  const resetFilters = () => { setQuery(''); setState('') }

  return (
    <div className="mx-auto max-w-6xl px-5 py-7 sm:px-10 sm:py-10">
      <a href="#station-readings" className="skip-link">Skip to station readings</a>
      <Header />
      <main>
        <div className="py-12 sm:py-16">
          <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lime"><Wind size={16} aria-hidden="true" /> A little clarity in the air</p>
          <h1 className="text-5xl leading-[1.08] font-medium tracking-tight sm:text-7xl">Our air.<br /><span className="text-lime">At a glance.</span></h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted">Check the latest available air quality readings across Malaysia.</p>
        </div>

        {result && <SummaryStrip stations={result.stations} />}

        <section id="station-readings" aria-labelledby="stations-heading" tabIndex={-1}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.16em] text-muted">Across Malaysia</p>
              <h2 id="stations-heading" className="text-2xl font-medium tracking-tight">Station readings</h2>
            </div>
            <p className="text-xs text-muted">Malaysian Air Pollutant Index · API / IPU</p>
          </div>
          <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-end">
            <SearchBar value={query} onChange={setQuery} />
            <StateFilter states={stationStates(stations)} value={state} onChange={setState} />
            <button type="button" onClick={load} disabled={loading || waitSeconds > 0} aria-describedby="refresh-guidance" className="flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-lime px-5 py-3.5 text-sm font-medium text-ink">
              <RefreshCw size={16} aria-hidden="true" className={loading ? 'animate-spin' : ''} />{loading ? 'Refreshing…' : error ? 'Retry' : 'Refresh'}
            </button>
          </div>
          <p id="refresh-guidance" className="mb-6 text-xs leading-5 text-muted">{cooldown || (loading ? 'Requesting the latest available snapshot…' : 'Refresh requests a new snapshot when the provider cache allows.')} {waitSeconds > 0 && (error ? 'Retry is temporarily paused.' : 'Readings are cached to avoid excessive requests.')}</p>
          {!result && loading && <p role="status" className="flex items-center gap-3 rounded-[26px] bg-panel p-8 text-sm text-muted"><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Loading station readings…</p>}
          {error && <div role="alert" className="mb-5 flex gap-3 rounded-2xl bg-yellow-200/10 p-5 text-sm leading-6 text-yellow-100"><CircleAlert className="shrink-0" size={20} aria-hidden="true" /><p>{error}{result && ' Showing the previously loaded snapshot; observations have not been updated.'}</p></div>}
          {freshness && <p role="status" className="mb-5 rounded-2xl bg-yellow-200/10 p-5 text-sm leading-6 text-yellow-100">{freshness}</p>}
          {result && <>
            <p role="status" className="mb-5 text-sm text-muted">Showing {filtered.length} of {stations.length} returned stations</p>
            {!error && <p className="sr-only" role="status">{loading ? 'Refreshing station readings.' : notice}</p>}
            {stations.length === 0 ? <p className="rounded-[26px] bg-panel p-8 text-sm text-muted">Haze Monitor returned no stations. Try refreshing when available.</p> : filtered.length === 0 ? <div className="rounded-[26px] bg-panel p-8">
              <h3 className="font-medium">No matching stations</h3>
              <p className="mt-2 text-sm text-muted">Try another station name or state, or clear your filters.</p>
              <button type="button" onClick={resetFilters} className="mt-5 rounded-xl bg-lime px-4 py-3 text-sm font-medium text-ink">Clear filters</button>
            </div> : <ul aria-busy={loading} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-5">
              {filtered.map((station, index) => (
                <li key={`${displayText(station.id, 'station')}-${index}`} className="min-w-0"><StationCard station={station} now={now} /></li>
              ))}
            </ul>}
          </>}

        </section>
      </main>
      <Footer />
    </div>
  )
}
