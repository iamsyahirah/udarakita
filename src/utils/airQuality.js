// Keep unknown or malformed values distinct from a real zero IPU reading.
export function validIpu(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null
}

export function displayText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

const formatter = new Intl.DateTimeFormat('en-MY', {
  dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur',
})

export function observationTime(value) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return null
  return formatter.format(new Date(value))
}
