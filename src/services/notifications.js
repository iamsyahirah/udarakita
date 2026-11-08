const HISTORY_KEY = 'udarakita:alert-history:v1'

export function readAlertHistory() {
  try {
    const data = JSON.parse(localStorage.getItem(HISTORY_KEY))
    return new Set(Array.isArray(data) ? data.filter(key => typeof key === 'string').slice(-100) : [])
  } catch { return new Set() }
}

export function rememberAlert(history, key) {
  history.add(key)
  while (history.size > 100) history.delete(history.values().next().value)
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify([...history])) } catch { /* Session deduplication still works. */ }
}

export async function showAppNotification(title, body, tag) {
  if (!('Notification' in window) || Notification.permission !== 'granted') throw new Error('Notification permission is required.')
  const options = { body, tag, icon: '/pwa-192.png', data: { url: '/#places' } }
  const registration = await navigator.serviceWorker?.getRegistration()
  if (registration?.active && registration.showNotification) return registration.showNotification(title, options)
  const notification = new Notification(title, options)
  notification.onclick = () => { window.focus(); window.location.hash = 'places'; notification.close() }
}
