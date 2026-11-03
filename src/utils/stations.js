import { displayText } from './airQuality.js'

export function stationStates(stations) {
  return [...new Set(stations.map(station => displayText(station.state, '')).filter(Boolean))].sort((a, b) => a.localeCompare(b))
}

export function filterStations(stations, query, state) {
  const keyword = query.trim().toLocaleLowerCase()
  return stations.filter(station => {
    const name = displayText(station.name, '')
    const stationState = displayText(station.state, '')
    return (!state || stationState === state) && (!keyword || `${name} ${stationState}`.toLocaleLowerCase().includes(keyword))
  })
}

// DOE observations are generally hourly; three hours is our UI freshness threshold.
export const STALE_AFTER_MS = 3 * 60 * 60 * 1000

export function isOldObservation(observedAt, now = Date.now()) {
  return typeof observedAt === 'string' && Number.isFinite(Date.parse(observedAt)) && now - Date.parse(observedAt) > STALE_AFTER_MS
}

export function freshnessMessage(snapshot, now = Date.now()) {
  if (!snapshot || !snapshot.stations.length) return ''
  if (snapshot.stale) return 'Data may be outdated. Haze Monitor marked this snapshot as stale.'
  const old = snapshot.stations.filter(station => isOldObservation(station.observedAt, now)).length
  if (old) return `Data may be outdated. ${old} station observation${old === 1 ? ' is' : 's are'} more than 3 hours old.`
  if (snapshot.stations.some(station => typeof station.observedAt !== 'string' || !Number.isFinite(Date.parse(station.observedAt)))) {
    return 'Some observation times are unavailable. Freshness cannot be verified for those stations.'
  }
  return ''
}
