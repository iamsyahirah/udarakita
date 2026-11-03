import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { fetchAirQuality } from '../src/services/hazeApi.js'
import { validIpu, observationTime } from '../src/utils/airQuality.js'

const fixture = { stations: [{ id: 'test', name: 'Test station', api: null }] }

test('service keeps nullable readings and passes request cancellation', async () => {
  const controller = new AbortController()
  const fetchMock = mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/.netlify/functions/air-quality')
    assert.equal(options.headers.Accept, 'application/json')
    assert.equal(options.signal, controller.signal)
    return Response.json(fixture)
  })
  try { assert.deepEqual(await fetchAirQuality({ signal: controller.signal }), fixture) }
  finally { fetchMock.mock.restore() }
})

test('service rejects HTTP errors, malformed JSON, and missing station arrays', async () => {
  for (const response of [new Response('', { status: 503 }), new Response('not JSON'), Response.json({ stations: {} }), Response.json(null)]) {
    const fetchMock = mock.method(globalThis, 'fetch', async () => response)
    try { await assert.rejects(fetchAirQuality()) }
    finally { fetchMock.mock.restore() }
  }
})

test('IPU zero is preserved while missing, negative, and nonnumeric readings are unavailable', () => {
  assert.equal(validIpu(0), 0)
  assert.equal(validIpu(53), 53)
  for (const value of [null, undefined, '', '53', -1, NaN, Infinity]) assert.equal(validIpu(value), null)
})

test('observation dates use Malaysia time and invalid dates remain unavailable', () => {
  assert.equal(observationTime(null), null)
  assert.equal(observationTime('invalid'), null)
  assert.match(observationTime('2026-11-03T17:00:00Z'), /4 Nov 2026/)
  assert.match(observationTime('2026-11-03T17:00:00Z'), /1:00/)
})

test('function caches and coalesces concurrent calls using upstream cache lifetime', async () => {
  const { handler } = await import('../netlify/functions/air-quality.mjs?cache-test')
  let calls = 0
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    calls++
    return Response.json(fixture, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400' } })
  })
  try {
    const [first, second] = await Promise.all([handler({ httpMethod: 'GET' }), handler({ httpMethod: 'GET' })])
    assert.equal(first.statusCode, 200)
    assert.deepEqual(JSON.parse(first.body), fixture)
    assert.deepEqual(first, second)
    assert.equal((await handler({ httpMethod: 'GET' })).headers['Cache-Control'], 'public, s-maxage=300, stale-while-revalidate=86400')
    assert.equal(calls, 1)
    assert.equal((await handler({ httpMethod: 'POST' })).statusCode, 405)
  } finally { fetchMock.mock.restore() }
})

test('function honors Retry-After without repeatedly requesting a failing provider', async () => {
  const { handler } = await import('../netlify/functions/air-quality.mjs?retry-test')
  let calls = 0
  const fetchMock = mock.method(globalThis, 'fetch', async () => {
    calls++
    return new Response('', { status: 429, headers: { 'Retry-After': '120' } })
  })
  try {
    const first = await handler({ httpMethod: 'GET' })
    assert.equal(first.statusCode, 502)
    assert.ok(Number(first.headers['Retry-After']) >= 119)
    assert.equal((await handler({ httpMethod: 'GET' })).statusCode, 503)
    assert.equal(calls, 1)
  } finally { fetchMock.mock.restore() }
})
