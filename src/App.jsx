import { useEffect, useState } from 'react'
import { ArrowUpRight, CircleAlert, LoaderCircle, Radio, Wind } from 'lucide-react'
import { fetchAirQuality } from './services/hazeApi.js'
import { displayText, observationTime, validIpu } from './utils/airQuality.js'

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
    <main className="mx-auto max-w-4xl px-5 py-8 sm:px-10 sm:py-12">
      <div className="mb-14 flex items-center gap-3">
        <img src="/favicon.svg" alt="" className="size-11" />
        <div>
          <p className="text-xl font-semibold tracking-tight">UdaraKita<span className="text-lime">.</span></p>
          <p className="text-xs text-muted">Malaysia Air Quality Checker</p>
        </div>
      </div>

      <div className="mb-9">
        <p className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-lime"><Wind size={16} aria-hidden="true" /> A little clarity in the air</p>
        <h1 className="max-w-xl text-4xl leading-[1.12] font-medium tracking-tight sm:text-6xl">Our air.<br /><span className="text-lime">At a glance.</span></h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-muted">Check the latest available air quality readings across Malaysia.</p>
      </div>

      <section aria-labelledby="stations-heading" className="rounded-[28px] bg-panel p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-5">
          <Radio size={19} className="text-lime" aria-hidden="true" />
          <h2 id="stations-heading" className="text-lg font-medium">Station readings</h2>
          <span className="ml-auto text-xs text-muted">API / IPU</span>
        </div>
        {!result && !error && <p role="status" className="flex items-center gap-3 py-8 text-sm text-muted"><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Loading station readings…</p>}
        {error && <div role="alert" className="flex gap-3 rounded-2xl bg-yellow-200/10 p-5 text-sm leading-6 text-yellow-100"><CircleAlert className="shrink-0" size={20} aria-hidden="true" /><p>{error} You can reopen this page later to try again.</p></div>}
        {result?.stations.length === 0 && <p className="py-8 text-sm text-muted">Haze Monitor returned no stations.</p>}
        {result?.stale && <p role="status" className="mb-5 text-sm text-yellow-200">The provider indicates that these observations may be outdated.</p>}
        {result && <ul className="divide-y divide-white/10">
          {result.stations.map((station, index) => {
            const ipu = validIpu(station.api)
            const time = observationTime(station.observedAt)
            return (
              <li key={`${displayText(station.id, 'station')}-${index}`} className="flex items-start justify-between gap-4 py-5 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <h3 className="break-words font-medium">{displayText(station.name, 'Unnamed station')}</h3>
                  <p className="mt-1 text-sm text-muted">{displayText(station.state, 'State unavailable')}</p>
                  <p className="mt-3 text-xs leading-5 text-muted">{time ? <><time dateTime={station.observedAt}>{time}</time> MYT</> : 'Observation time unavailable'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={ipu === null ? 'text-sm text-muted' : 'text-3xl font-medium tracking-tight text-lime'}>{ipu ?? 'Unavailable'}</p>
                  <p className="mt-1 max-w-32 text-xs leading-5 text-muted">{ipu === null ? 'Reading unavailable' : displayText(station.category, 'Category unavailable')}</p>
                </div>
              </li>
            )
          })}
        </ul>}
      </section>
      <div className="mt-7 space-y-2 text-xs leading-5 text-muted">
        <p>Data provided by Haze Monitor; Malaysian observations sourced from the Department of Environment (DOE/JAS).</p>
        <p>For official public-health advice, consult relevant Malaysian authorities.</p>
        <p className="flex gap-5 pt-2"><a className="inline-flex items-center gap-1" href="https://hazemonitor.com/developers">Haze Monitor <ArrowUpRight size={13} aria-hidden="true" /></a><a className="inline-flex items-center gap-1" href="https://www.doe.gov.my/">DOE / JAS <ArrowUpRight size={13} aria-hidden="true" /></a></p>
      </div>
    </main>
  )
}
