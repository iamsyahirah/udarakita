import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validCoordinates, distanceKm, nearestStations } from '../src/utils/places.js'

test('distances handle matching points, dateline crossings, and antipodes', () => {
  assert.equal(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 0 }), 0)
  assert.ok(Math.abs(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 1 }) - 111.195) < 0.01)
  assert.ok(Math.abs(distanceKm({ latitude: 0, longitude: 179 }, { latitude: 0, longitude: -179 }) - 222.39) < 0.01)
  assert.ok(Math.abs(distanceKm({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 180 }) - 20015.09) < 0.01)
})

test('invalid or missing station coordinates are excluded without inventing locations', () => {
  for (const [latitude, longitude] of [[null, 100], ['3', 100], [NaN, 100], [91, 100], [3, -181], [Infinity, 100]]) {
    assert.equal(validCoordinates(latitude, longitude), false)
    assert.equal(distanceKm({ latitude: 3, longitude: 100 }, { latitude, longitude }), null)
  }
  assert.deepEqual(nearestStations([{ latitude: 3, longitude: 100 }], null), [])
})

test('GPS ranking sorts real coordinates and leaves readings and source order intact', () => {
  const stations = [
    { id: 'far', latitude: 4, longitude: 101, api: 80 },
    { id: 'missing', latitude: null, longitude: null, api: 50 },
    { id: 'near', latitude: 3, longitude: 101, api: 0 },
  ]
  const ranked = nearestStations(stations, { latitude: 3.01, longitude: 101 })
  assert.deepEqual(ranked.map(item => item.station.id), ['near', 'far'])
  assert.equal(ranked[0].station.api, 0)
  assert.deepEqual(stations.map(station => station.id), ['far', 'missing', 'near'])
})
