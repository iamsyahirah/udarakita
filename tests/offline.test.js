import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { fetchAirQuality } from '../src/services/hazeApi.js'
import { readSnapshot, saveSnapshot } from '../src/services/offlineSnapshot.js'

const fixture = { stations: [{ id: 'test', name: 'Test station', api: 0, observedAt: '2026-11-08T01:00:00Z' }] }

async function withStorage(run) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const values = new Map()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  } })
  try { await run(values) } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original)
    else delete globalThis.localStorage
  }
}

test('network failure restores a validated snapshot with original readings and an explicit offline flag', async () => {
  await withStorage(async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json(fixture))
    try {
      await fetchAirQuality()
      fetchMock.mock.mockImplementation(async () => { throw new TypeError('Failed to fetch') })
      const data = await fetchAirQuality()
      assert.deepEqual(data.stations, fixture.stations)
      assert.equal(data.offline, true)
      assert.ok(data.savedAt > 0)
      assert.equal(data.nextRequestAt, 0)
      fetchMock.mock.mockImplementation(async () => Response.json({ stations: [] }))
      const recovered = await fetchAirQuality()
      assert.equal(recovered.offline, undefined)
      assert.deepEqual(recovered.stations, [])
    } finally { fetchMock.mock.restore() }
  })
})

test('offline first visit explains the need to connect', async () => {
  await withStorage(async () => {
    const fetchMock = mock.method(globalThis, 'fetch', async () => { throw new TypeError('Failed to fetch') })
    try { await assert.rejects(fetchAirQuality(), /no saved snapshot/) }
    finally { fetchMock.mock.restore() }
  })
})

test('saved data does not mask HTTP errors or cancelled requests', async () => {
  await withStorage(async () => {
    saveSnapshot(fixture)
    const fetchMock = mock.method(globalThis, 'fetch', async () => new Response('', { status: 503 }))
    try {
      await assert.rejects(fetchAirQuality(), /HTTP 503/)
      fetchMock.mock.mockImplementation(async () => { throw new DOMException('Aborted', 'AbortError') })
      await assert.rejects(fetchAirQuality(), { name: 'AbortError' })
    } finally { fetchMock.mock.restore() }
  })
})

test('corrupt or unavailable storage cannot break live readings', async () => {
  await withStorage(async (values) => {
    for (const value of ['not JSON', '{}', '{"data":{"stations":[null]},"savedAt":1}']) {
      values.set('udarakita:air-quality:v1', value)
      assert.equal(readSnapshot(), null)
    }
    const storageMock = mock.method(localStorage, 'setItem', () => { throw new Error('Storage full') })
    const fetchMock = mock.method(globalThis, 'fetch', async () => Response.json(fixture))
    try { assert.deepEqual((await fetchAirQuality()).stations, fixture.stations) }
    finally { storageMock.mock.restore(); fetchMock.mock.restore() }
  })
})
