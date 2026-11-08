const SNAPSHOT_KEY = 'udarakita:air-quality:v1'

export function saveSnapshot(data) {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ data, savedAt: Date.now() }))
  } catch {
    // Storage can be unavailable or full. Live readings should still work.
  }
}

export function readSnapshot() {
  try {
    const snapshot = JSON.parse(localStorage.getItem(SNAPSHOT_KEY))
    if (!Array.isArray(snapshot?.data?.stations) || !Number.isFinite(snapshot.savedAt) || snapshot.savedAt <= 0) return null
    if (!snapshot.data.stations.every((station) => station && typeof station === 'object' && !Array.isArray(station))) return null
    return {
      ...snapshot.data,
      offline: true,
      savedAt: snapshot.savedAt,
      nextRequestAt: 0,
    }
  } catch {
    return null
  }
}
