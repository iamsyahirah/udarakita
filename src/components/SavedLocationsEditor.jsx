import { useState } from 'react'
import { MAX_SAVED_PLACES } from '../services/savedPlaces.js'

export default function SavedLocationsEditor({ saved, stations }) {
  const [stationId, setStationId] = useState('')
  const options = stations.filter(station => typeof station.id === 'string' && typeof station.name === 'string').slice().sort((a, b) => a.name.localeCompare(b.name))
  const add = event => {
    event.preventDefault()
    const station = options.find(station => station.id === stationId)
    if (station && saved.save(station)) setStationId('')
  }
  return <div className="settings-row-extra">
    <form onSubmit={add} className="space-y-3">
      <label htmlFor="save-station" className="block text-xs text-muted">Choose a monitoring station</label>
      <select id="save-station" value={stationId} onChange={event => setStationId(event.target.value)} className="control w-full px-3" disabled={!options.length}>
        <option value="">{options.length ? 'Select a station' : 'Load readings to add a location'}</option>
        {options.map(station => <option key={station.id} value={station.id} disabled={saved.isSaved(station.id)}>{station.name} · {station.state || 'State unavailable'}{saved.isSaved(station.id) ? ' (saved)' : ''}</option>)}
      </select>
      <button type="submit" disabled={!stationId || saved.places.length >= MAX_SAVED_PLACES} className="secondary-button">Save location</button>
    </form>
    {saved.places.length ? <ul aria-label="Saved locations" className="mt-5 divide-y divide-white/10">{saved.places.map(place => <li key={place.id} className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0"><p className="break-words text-sm font-medium">{place.name}</p><p className="text-xs leading-5 text-muted">{place.state || 'State unavailable'}</p></div>
      <button type="button" onClick={() => saved.remove(place.id)} aria-label={`Remove ${place.name} from saved locations`} className="min-h-11 shrink-0 px-2 text-xs text-muted underline">Remove</button>
    </li>)}</ul> : <p className="mt-4 text-xs leading-5 text-muted">No saved locations yet.</p>}
    <p className="mt-3 text-xs leading-5 text-muted">Saved on this device · up to {MAX_SAVED_PLACES} stations. GPS coordinates are not saved.</p>
  </div>
}
