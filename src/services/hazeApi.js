export const AIR_QUALITY_URL = '/.netlify/functions/air-quality'

export async function fetchAirQuality({ signal } = {}) {
  const response = await fetch(AIR_QUALITY_URL, {
    headers: { Accept: 'application/json' },
    signal,
  })
  if (!response.ok) {
    const retry = response.headers.get('retry-after')
    throw new Error(`Haze Monitor is currently unavailable (HTTP ${response.status}).${retry ? ' Please try again later.' : ''}`)
  }
  let data
  try { data = await response.json() } catch { throw new Error('Haze Monitor returned an unreadable response.') }
  if (!Array.isArray(data?.stations)) throw new Error('Haze Monitor returned an unexpected station response.')
  return {
    ...data,
    stations: data.stations.filter((station) => station && typeof station === 'object' && !Array.isArray(station)),
  }
}
