export const AIR_QUALITY_URL = '/.netlify/functions/air-quality'

export function cacheLifetime(cacheControl) {
  if (/\b(no-store|no-cache)\b/i.test(cacheControl || '')) return 0
  const shared = cacheControl?.match(/\bs-maxage\s*=\s*"?(\d+)/i)
  const browser = cacheControl?.match(/\bmax-age\s*=\s*"?(\d+)/i)
  return Number(shared?.[1] ?? browser?.[1] ?? 300) * 1000
}

export function retryDeadline(value, now = Date.now()) {
  if (value && /^\d+$/.test(value.trim())) return now + Number(value) * 1000
  const date = Date.parse(value)
  return Number.isFinite(date) ? Math.max(now, date) : now + 30_000
}

export async function fetchAirQuality({ signal } = {}) {
  const response = await fetch(AIR_QUALITY_URL, { headers: { Accept: 'application/json' }, signal })
  if (!response.ok) {
    const error = new Error(`Haze Monitor is currently unavailable (HTTP ${response.status}). Please try again when retry is available.`)
    error.nextRequestAt = retryDeadline(response.headers.get('retry-after'))
    throw error
  }
  let data
  try { data = await response.json() } catch { throw new Error('Haze Monitor returned an unreadable response.') }
  if (!Array.isArray(data?.stations)) throw new Error('Haze Monitor returned an unexpected station response.')
  return {
    ...data,
    stations: data.stations.filter((station) => station && typeof station === 'object' && !Array.isArray(station)),
    nextRequestAt: Date.now() + cacheLifetime(response.headers.get('cache-control')),
  }
}
