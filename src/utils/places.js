export function validCoordinates(latitude, longitude) {
  return Number.isFinite(latitude) && Math.abs(latitude) <= 90 && Number.isFinite(longitude) && Math.abs(longitude) <= 180
}

export function distanceKm(from, to) {
  if (!validCoordinates(from?.latitude, from?.longitude) || !validCoordinates(to?.latitude, to?.longitude)) return null
  const radians = (degrees) => degrees * Math.PI / 180
  const latitude = radians(to.latitude - from.latitude)
  const longitude = radians(to.longitude - from.longitude)
  const a = Math.sin(latitude / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitude / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, a))))
}

export function nearestStations(stations, position) {
  return stations.map(station => ({ station, distance: distanceKm(position, station) }))
    .filter(item => item.distance !== null)
    .sort((a, b) => a.distance - b.distance)
}
