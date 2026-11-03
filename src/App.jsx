import { useEffect, useState } from 'react'
import { CircleAlert, LoaderCircle, Wind } from 'lucide-react'
import Header from './components/Header.jsx'
import SummaryStrip from './components/SummaryStrip.jsx'
import StationCard from './components/StationCard.jsx'
import Footer from './components/Footer.jsx'
import { fetchAirQuality } from './services/hazeApi.js'
import { displayText } from './utils/airQuality.js'

export default function App() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetchAirQuality({ signal: controller.signal }).then(setResult).catch((error) => {
      if (!controller.signal.aborted) setError(error.message || 'Unable to load station readings.')
    })
    return () => controller.abort()
  }, [])

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
          {!result && !error && <p role="status" className="flex items-center gap-3 rounded-[26px] bg-panel p-8 text-sm text-muted"><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Loading station readings…</p>}
          {error && <div role="alert" className="flex gap-3 rounded-2xl bg-yellow-200/10 p-5 text-sm leading-6 text-yellow-100"><CircleAlert className="shrink-0" size={20} aria-hidden="true" /><p>{error} You can reopen this page later to try again.</p></div>}
          {result?.stations.length === 0 && <p className="rounded-[26px] bg-panel p-8 text-sm text-muted">Haze Monitor returned no stations.</p>}
          {result?.stale && <p role="status" className="mb-5 text-sm text-yellow-200">The provider indicates that these observations may be outdated.</p>}
          {result && <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 sm:gap-5">
            {result.stations.map((station, index) => (
              <li key={`${displayText(station.id, 'station')}-${index}`} className="min-w-0"><StationCard station={station} /></li>
            ))}
          </ul>}
        </section>
      </main>
      <Footer />
    </div>
  )
}
