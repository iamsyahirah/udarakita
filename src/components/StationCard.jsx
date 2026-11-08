import { isOldObservation } from '../utils/stations.js'
import { Bookmark, BookmarkCheck, Clock3, MapPin } from 'lucide-react'
import { airQualityCategory, displayText, observationTime, validIpu } from '../utils/airQuality.js'

export default function StationCard({ station, now, savedPlaces }) {
  const ipu = validIpu(station.api)
  const time = observationTime(station.observedAt)
  const category = airQualityCategory(station.api, station.category)

  return (
    <article className="flex h-full min-w-0 flex-col rounded-[26px] bg-panel p-5 sm:p-6">
      <div className="mb-6">
        <h3 className="break-words text-lg font-medium tracking-tight">{displayText(station.name, 'Unnamed station')}</h3>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-muted"><MapPin size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{displayText(station.state, 'State unavailable')}</p>
      </div>
      <div className={`reading-panel category-${category.tone} mt-auto rounded-[20px] p-5`}>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em]">Malaysian API / IPU</p>
        <p className={ipu === null ? 'text-2xl font-medium' : 'text-6xl font-medium tracking-tight tabular-nums'}>{ipu ?? 'Unavailable'}</p>
        <p className="mt-4 flex items-start gap-2 text-sm font-medium"><span className="mt-1 size-2 shrink-0 rounded-full bg-current" aria-hidden="true" />{category.label}</p>
      </div>
      {isOldObservation(station.observedAt, now) && <p className="mt-4 text-xs text-yellow-200">Data may be outdated · over 3 hours old</p>}
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted"><Clock3 size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><span>Observed<br />{time ? <><time dateTime={station.observedAt}>{time}</time> MYT</> : 'Observation time unavailable'}</span></p>
      {savedPlaces && <button type="button" onClick={() => savedPlaces.isSaved(station.id) ? savedPlaces.remove(station.id) : savedPlaces.save(station)} aria-pressed={savedPlaces.isSaved(station.id)} aria-label={`${savedPlaces.isSaved(station.id) ? 'Remove' : 'Save'} ${displayText(station.name, 'station')}${savedPlaces.isSaved(station.id) ? ' from saved locations' : ' to saved locations'}`} className="secondary-button mt-5 inline-flex items-center justify-center gap-2">
        {savedPlaces.isSaved(station.id) ? <BookmarkCheck size={16} aria-hidden="true" /> : <Bookmark size={16} aria-hidden="true" />}{savedPlaces.isSaved(station.id) ? 'Saved' : 'Save location'}
      </button>}
    </article>
  )
}
