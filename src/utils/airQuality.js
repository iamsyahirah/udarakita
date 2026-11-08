// Keep unknown or malformed values distinct from a real zero IPU reading.
export function validIpu(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

export function displayText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

const formatters = Object.fromEntries(['en-MY', 'ms-MY'].map(locale => [locale, new Intl.DateTimeFormat(locale, {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur',
})]))

export function observationTime(value, locale = 'en-MY') {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return null
  return (formatters[locale] || formatters['en-MY']).format(new Date(value))
}

const categories = [
  { ceiling: 50, label: 'Good / Baik', tone: 'good', names: ['good', 'baik'] },
  { ceiling: 100, label: 'Moderate / Sederhana', tone: 'moderate', names: ['moderate', 'sederhana'] },
  { ceiling: 200, label: 'Unhealthy / Tidak Sihat', tone: 'unhealthy', names: ['unhealthy', 'tidak sihat'] },
  { ceiling: 300, label: 'Very Unhealthy / Sangat Tidak Sihat', tone: 'very-unhealthy', names: ['very unhealthy', 'sangat tidak sihat'] },
  { ceiling: Infinity, label: 'Hazardous / Berbahaya', tone: 'hazardous', names: ['hazardous', 'berbahaya'] },
]

export function airQualityCategory(api, providerCategory) {
  const supplied = displayText(providerCategory, '')
  if (supplied) {
    const normalized = supplied.toLowerCase()
    const category = categories.find(({ label, names }) => names.includes(normalized) || label.toLowerCase() === normalized)
    // Preserve the provider's label; unknown categories get a neutral indicator.
    return { label: supplied, tone: category?.tone ?? 'unavailable' }
  }
  const reading = validIpu(api)
  const category = reading === null ? null : categories.find(({ ceiling }) => reading <= ceiling)
  return category ? { label: category.label, tone: category.tone } : { label: 'Unavailable', tone: 'unavailable' }
}

export function latestObservation(stations) {
  return stations.reduce((latest, station) => {
    const timestamp = station.observedAt
    if (!observationTime(timestamp)) return latest
    return !latest || Date.parse(timestamp) > Date.parse(latest) ? timestamp : latest
  }, null)
}
