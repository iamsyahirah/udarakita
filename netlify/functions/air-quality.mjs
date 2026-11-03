const UPSTREAM = 'https://hazemonitor.com/api/air-quality'

// Per-instance cache also avoids duplicate upstream calls in local development.
let snapshot
let expiresAt = 0
let pending
let retryAt = 0

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: { Allow: 'GET' }, body: 'Method not allowed' }
  }
  if (snapshot && Date.now() < expiresAt) return snapshot
  if (pending) return pending
  if (Date.now() < retryAt) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': String(Math.ceil((retryAt - Date.now()) / 1000)) },
      body: JSON.stringify({ message: 'The data provider is temporarily unavailable. Please try again later.' }),
    }
  }

  pending = (async () => {
    try {
      const response = await fetch(UPSTREAM, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15_000),
      })
      if (!response.ok) {
        const retry = response.headers.get('retry-after')
        const delay = retry && /^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - Date.now()
        retryAt = Date.now() + Math.max(30_000, Number.isFinite(delay) ? delay : 0)
        throw new Error('Upstream request failed')
      }
      const data = await response.json()
      if (!Array.isArray(data?.stations)) throw new Error('Invalid upstream response')
      const cacheControl = response.headers.get('cache-control') || 'public, max-age=300'
      const ttl = Number(cacheControl.match(/(?:s-maxage|max-age)=(\d+)/)?.[1] ?? 300)
      snapshot = {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': cacheControl },
        body: JSON.stringify(data),
      }
      const age = Number(response.headers.get('age') || 0)
      expiresAt = Date.now() + Math.max(0, ttl - age) * 1000
      return snapshot
    } catch {
      retryAt = Math.max(retryAt, Date.now() + 30_000)
      return {
        statusCode: 502,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Retry-After': String(Math.ceil((retryAt - Date.now()) / 1000)) },
        body: JSON.stringify({ message: 'Station readings could not be loaded from Haze Monitor. Please try again later.' }),
      }
    }
  })()
  try { return await pending } finally { pending = undefined }
}
