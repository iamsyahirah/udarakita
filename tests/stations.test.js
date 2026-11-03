import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { stationStates, filterStations, isOldObservation, freshnessMessage, STALE_AFTER_MS } from '../src/utils/stations.js'
import { cacheLifetime, retryDeadline, fetchAirQuality } from '../src/services/hazeApi.js'

const stations = [
  { name: 'Kangar', state: 'Perlis' },
  { name: 'Sungai Petani', state: 'Kedah' },
  { name: 'Alor Setar', state: 'Kedah' },
  { name: null, state: null },
]

test('state options are distinct, sorted, and exclude missing states', () => {
  assert.deepEqual(stationStates(stations), ['Kedah', 'Perlis'])
})

test('search matches names and states case-insensitively and combines with state selection', () => {
  assert.equal(filterStations(stations, '  SUNGAI ', '').length, 1)
  assert.equal(filterStations(stations, 'kEdAh', '').length, 2)
  assert.equal(filterStations(stations, 'a', 'Kedah').length, 2)
  assert.equal(filterStations(stations, 'kangar', 'Kedah').length, 0)
  assert.equal(filterStations(stations, '', '').length, 4)
  assert.equal(filterStations(stations, 'missing', '').length, 0)
})

test('freshness detects provider stale flags, old individual times, and unknown timestamps', () => {
  const now = Date.parse('2026-11-04T04:00:00+08:00')
  const timestamp = new Date(now - STALE_AFTER_MS).toISOString()
  assert.equal(isOldObservation(timestamp, now), false)
  assert.equal(isOldObservation(timestamp, now + 1), true)
  assert.equal(isOldObservation(null, now), false)
  assert.match(freshnessMessage({ stale: true, stations: [{ observedAt: timestamp }] }, now), /marked.*stale/)
  assert.match(freshnessMessage({ stations: [{ observedAt: timestamp }] }, now + 1), /1 station observation is/)
  assert.match(freshnessMessage({ stations: [{ observedAt: null }] }, now), /cannot be verified/)
  assert.equal(freshnessMessage({ stations: [] }, now), '')
  assert.equal(freshnessMessage({ stations: [{ observedAt: timestamp }] }, now), '')
})

test('cache guidance gives shared max-age precedence and honors no-store', () => {
  assert.equal(cacheLifetime('public, max-age=60, s-maxage=300'), 300000)
  assert.equal(cacheLifetime('max-age=60'), 60000)
  assert.equal(cacheLifetime('no-store'), 0)
  assert.equal(cacheLifetime('no-cache, max-age=300'), 0)
  assert.equal(cacheLifetime(null), 300000)
})

test('retry deadlines handle seconds, HTTP dates, and missing guidance', () => {
  const now = Date.parse('2026-11-03T20:00:00Z')
  assert.equal(retryDeadline('120', now), now + 120000)
  assert.equal(retryDeadline('Tue, 03 Nov 2026 20:02:00 GMT', now), now + 120000)
  assert.equal(retryDeadline(null, now), now + 30000)
  assert.equal(retryDeadline('invalid', now), now + 30000)
})

test('HTTP failures expose Retry-After to the UI', async () => {
  const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('', { status: 429, headers: { 'Retry-After': '120' } }))
  try {
    await assert.rejects(fetchAirQuality(), error => {
      assert.ok(error.nextRequestAt >= Date.now() + 119000)
      return true
    })
  } finally { fetchMock.mock.restore() }
})
