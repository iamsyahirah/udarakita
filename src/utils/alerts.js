import { displayText, validIpu } from './airQuality.js'
import { STALE_AFTER_MS } from './stations.js'

export function highIpuAlerts(snapshot, preferences, now = Date.now()) {
  if (!preferences.alertsEnabled || snapshot?.offline || snapshot?.stale || !Array.isArray(snapshot?.stations)) return []
  const watched = new Set(preferences.places.filter(place => !preferences.alertStationId || place.id === preferences.alertStationId).map(place => place.id))
  const seen = new Set()
  return snapshot.stations.flatMap(station => {
    if (!station || typeof station.id !== 'string') return []
    const timestamp = typeof station.observedAt === 'string' ? Date.parse(station.observedAt) : NaN
    const ipu = validIpu(station.api)
    if (!watched.has(station.id) || ipu === null || ipu < preferences.threshold || !Number.isFinite(timestamp) || now - timestamp > STALE_AFTER_MS || timestamp > now + 5 * 60_000) return []
    const key = JSON.stringify([station.id, timestamp, preferences.threshold])
    if (seen.has(key)) return []
    seen.add(key)
    return [{ key, id: station.id, name: displayText(station.name, preferences.places.find(place => place.id === station.id)?.name || 'Station'), api: ipu, observedAt: station.observedAt }]
  })
}
