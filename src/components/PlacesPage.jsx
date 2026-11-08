import { LocateFixed, MapPin } from 'lucide-react'
import { nearestStations } from '../utils/places.js'
import StationCard from './StationCard.jsx'
import ReadingStatus from './ReadingStatus.jsx'

export default function PlacesPage({ airQuality, location }) {
  const { position, locating, error, locate } = location
  const { result, now, load, loading, waitSeconds } = airQuality
  const all = position ? nearestStations(result?.stations ?? [], position) : []
  const nearby = all.slice(0, 6)

  return <>
    <div className="page-intro"><p className="eyebrow">Closer to you</p><h1 className="page-title">Places</h1><p className="page-description">Find monitoring stations nearest to your current location.</p></div>
    <section aria-labelledby="nearby-heading" className="mb-7 rounded-[26px] bg-panel p-6 sm:p-8">
      <MapPin size={26} aria-hidden="true" className="mb-4 text-lime" />
      <h2 id="nearby-heading" className="text-xl font-medium">Air quality nearby</h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted">Use your device’s location to sort stations by distance. Your coordinates stay in memory on this device and are cleared when you close or reload the app.</p>
      <button type="button" onClick={locate} disabled={locating} className="action-button mt-5 inline-flex items-center gap-2"><LocateFixed size={18} aria-hidden="true" />{locating ? 'Finding your location…' : position ? 'Update my location' : 'Use my location'}</button>
      {error && <p role="alert" className="mt-4 text-sm leading-6 text-yellow-100">{error}</p>}
      {position && <p role="status" className="mt-4 text-xs leading-5 text-muted">Location found{Number.isFinite(position.accuracy) ? ` · device accuracy approximately ${Math.round(position.accuracy).toLocaleString()} m` : ''}. Distances are straight-line estimates.</p>}
    </section>
    <ReadingStatus airQuality={airQuality} />
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <p className="max-w-xl text-xs leading-6 text-muted">Readings describe each monitoring station, rather than the exact air quality at your GPS position.</p>
      <button type="button" onClick={load} disabled={loading || waitSeconds > 0} className="secondary-button">{loading ? 'Refreshing…' : waitSeconds > 0 ? `Refresh in ${waitSeconds}s` : 'Refresh readings'}</button>
    </div>
    {position && result && <section aria-label="Nearest stations">
      {nearby.length ? <>
        <p role="status" className="mb-5 text-sm text-muted">Showing the nearest {nearby.length} of {all.length} stations with coordinates</p>
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{nearby.map(({ station, distance }, index) => <li key={`${station.id}-${index}`} className="flex min-w-0 flex-col gap-3">
          <p className="text-sm font-medium text-lime">{distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`} away</p>
          <StationCard station={station} now={now} />
        </li>)}</ul>
      </> : <p role="status" className="notice">Station coordinates are unavailable in this snapshot. Try refreshing, or find a station using Filters.</p>}
    </section>}
    <a href="#filters" className="mt-7 inline-flex min-h-11 items-center text-sm text-lime">Find a station using Filters →</a>
  </>
}
