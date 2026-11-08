import { displayText } from '../utils/airQuality.js'

export const SAVED_PLACES_KEY = 'udarakita:places:v1'
export const MAX_SAVED_PLACES = 20
export const ALERT_THRESHOLDS = [101, 201, 301]
export const defaultPreferences = () => ({ places: [], alertStationId: '', threshold: 101, alertsEnabled: false, browserNotifications: false })

export function normalizePreferences(value) {
  const defaults = defaultPreferences()
  const places = []
  for (const place of Array.isArray(value?.places) ? value.places : []) {
    if (typeof place?.id !== 'string' || !place.id.trim() || typeof place.name !== 'string' || !place.name.trim()) continue
    if (places.some(saved => saved.id === place.id)) continue
    places.push({ id: place.id, name: place.name.trim().slice(0, 120), state: displayText(place.state, '').slice(0, 120) })
    if (places.length === MAX_SAVED_PLACES) break
  }
  return {
    ...defaults, places,
    alertStationId: places.some(place => place.id === value?.alertStationId) ? value.alertStationId : '',
    threshold: ALERT_THRESHOLDS.includes(value?.threshold) ? value.threshold : defaults.threshold,
    alertsEnabled: value?.alertsEnabled === true,
    browserNotifications: value?.browserNotifications === true,
  }
}

export function readPreferences() {
  try { return { preferences: normalizePreferences(JSON.parse(localStorage.getItem(SAVED_PLACES_KEY))), error: '' } }
  catch { return { preferences: defaultPreferences(), error: 'Saved locations could not be loaded. Check this browser’s storage settings.' } }
}

export function writePreferences(preferences) {
  localStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(normalizePreferences(preferences)))
}
