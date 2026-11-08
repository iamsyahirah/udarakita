import { useTranslation } from '../contexts/AppPreferences.jsx'
import { useState } from 'react'
import { MAX_SAVED_PLACES } from '../services/savedPlaces.js'

export default function SavedLocationsEditor({ saved, stations }) {
  const { t, locale } = useTranslation()
  const [stationId, setStationId] = useState('')
  const options = stations.filter(station => typeof station.id === 'string' && typeof station.name === 'string').slice().sort((a, b) => a.name.localeCompare(b.name, locale))
  const add = event => {
    event.preventDefault()
    const station = options.find(station => station.id === stationId)
    if (station && saved.save(station)) setStationId('')
  }
  return <div className="settings-row-extra">
    <form onSubmit={add} className="space-y-3">
      <label htmlFor="save-station" className="block text-xs text-muted">{t("Choose a monitoring station")}</label>
      <select id="save-station" value={stationId} onChange={event => setStationId(event.target.value)} className="control w-full px-3" disabled={!options.length}>
        <option value="">{options.length ? t("Select a station") : t("Load readings to add a location")}</option>
        {options.map(station => <option key={station.id} value={station.id} disabled={saved.isSaved(station.id)}>{station.name} · {station.state || t("State unavailable")}{saved.isSaved(station.id) ? " " + t("(saved)") : ''}</option>)}
      </select>
      <button type="submit" disabled={!stationId || saved.places.length >= MAX_SAVED_PLACES} className="secondary-button">{t("Save location")}</button>
    </form>
    {saved.places.length ? <ul aria-label={t("Saved locations")} className="mt-5 divide-y divide-line">{saved.places.map(place => <li key={place.id} className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0"><p className="break-words text-sm font-medium">{place.name}</p><p className="text-xs leading-5 text-muted">{place.state || t("State unavailable")}</p></div>
      <button type="button" onClick={() => saved.remove(place.id)} aria-label={`${t('Remove')} ${place.name} ${t('from saved locations')}`} className="min-h-11 shrink-0 px-2 text-xs text-muted underline">{t("Remove")}</button>
    </li>)}</ul> : <p className="mt-4 text-xs leading-5 text-muted">{t("No saved locations yet.")}</p>}
    <p className="mt-3 text-xs leading-5 text-muted">{t('Saved on this device · up to {count} stations. GPS coordinates are not saved.', { count: MAX_SAVED_PLACES })}</p>
  </div>
}
