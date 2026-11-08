import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../contexts/AppPreferences.jsx'
import { highIpuAlerts } from '../utils/alerts.js'
import { readAlertHistory, rememberAlert, showAppNotification } from '../services/notifications.js'
import { observationTime } from '../utils/airQuality.js'

const permissionState = () => 'Notification' in window && window.isSecureContext ? Notification.permission : 'unsupported'

export default function useIpuAlerts(airQuality, saved) {
  const { t, locale } = useTranslation()
  const [permission, setPermission] = useState(permissionState)
  const [visible, setVisible] = useState(() => document.visibilityState === 'visible')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const history = useRef(null)
  const pending = useRef(new Set())
  if (!history.current) history.current = readAlertHistory()
  const alerts = airQuality.error || airQuality.loading ? [] : highIpuAlerts(airQuality.result, saved, airQuality.now)
  const active = useRef(null)
  active.current = { saved, permission, airQuality, t, locale }

  useEffect(() => {
    const sync = () => { setPermission(permissionState()); setVisible(document.visibilityState === 'visible') }
    window.addEventListener('focus', sync)
    document.addEventListener('visibilitychange', sync)
    return () => { window.removeEventListener('focus', sync); document.removeEventListener('visibilitychange', sync) }
  }, [])

  useEffect(() => {
    if (!visible || !saved.browserNotifications || permission !== 'granted') return
    for (const alert of alerts) {
      if (history.current.has(alert.key) || pending.current.has(alert.key)) continue
      pending.current.add(alert.key)
      // Recheck the user's settings before dispatching queued notifications.
      Promise.resolve().then(async () => {
        try {
          const send = async () => {
            const latest = active.current
            if (document.visibilityState !== 'visible') return
            if (!latest.saved.browserNotifications || latest.permission !== 'granted' || latest.airQuality.error || latest.airQuality.loading) return
            if (!highIpuAlerts(latest.airQuality.result, latest.saved).some(current => current.key === alert.key)) return
            const persisted = readAlertHistory()
            if (persisted.has(alert.key)) { history.current.add(alert.key); return }
            await showAppNotification(`${alert.name} · IPU ${alert.api}`, latest.t('High-IPU alert · observed {time} MYT.', { time: observationTime(alert.observedAt, latest.locale) }), `ipu-${alert.id}`)
            rememberAlert(persisted, alert.key)
            history.current = persisted
          }
          if (navigator.locks?.request) await navigator.locks.request('udarakita-ipu-alerts', send)
          else await send()
        } catch {
          // Avoid repeated attempts for the same observation in this session.
          history.current.add(alert.key)
          setMessage('Device notification could not be shown. In-app alerts are still available.')
        }
      }).finally(() => pending.current.delete(alert.key))
    }
  }, [airQuality.result, airQuality.error, airQuality.loading, saved.places, saved.alertStationId, saved.threshold, saved.alertsEnabled, saved.browserNotifications, permission, visible])

  const enableNotifications = async () => {
    if (busy) return
    if (permissionState() === 'unsupported') { setMessage('Device notifications are unavailable here. In-app alerts still work.'); return }
    setBusy(true)
    try {
      const next = await Notification.requestPermission()
      setPermission(next)
      if (next === 'granted') {
        if (saved.update({ browserNotifications: true })) setMessage('Device notifications enabled while the app is open.')
      } else setMessage(next === 'denied' ? 'Notifications are blocked. Change permission in your browser or device settings; in-app alerts still work.' : 'Notification permission was not granted. In-app alerts still work.')
    } catch { setMessage('Notification permission could not be requested. In-app alerts still work.') }
    finally { setBusy(false) }
  }

  const test = async () => {
    setBusy(true)
    try {
      await showAppNotification(t('UdaraKita · test notification'), t('Notifications are ready. High-IPU checks run while the app is open.'), 'udarakita-test')
      setMessage('Test notification sent.')
    } catch { setMessage('The test notification could not be shown. Check your browser or device permissions.') }
    finally { setBusy(false) }
  }

  return { alerts, permission, message, busy, enableNotifications, test }
}
