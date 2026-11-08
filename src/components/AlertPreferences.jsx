import { useTranslation } from '../contexts/AppPreferences.jsx'
import { ALERT_THRESHOLDS } from '../services/savedPlaces.js'

export default function AlertPreferences({ saved, notifications }) {
  const { t } = useTranslation()
  return <div className="settings-row-extra space-y-5">
    <label className="flex min-h-11 items-center gap-3 text-sm">
      <input type="checkbox" checked={saved.alertsEnabled} disabled={!saved.places.length && !saved.alertsEnabled} onChange={event => saved.update({ alertsEnabled: event.target.checked })} className="size-5 accent-lime" />{t("Enable high-IPU alerts")}</label>
    {!saved.places.length && <p className="text-xs leading-5 text-muted">{t("Save a station above to enable alerts.")}</p>}
    <div>
      <label htmlFor="alert-station" className="mb-2 block text-xs text-muted">{t("Alert location")}</label>
      <select id="alert-station" value={saved.alertStationId} onChange={event => saved.update({ alertStationId: event.target.value })} disabled={!saved.places.length} className="control w-full px-3">
        <option value="">{t("All saved locations")}</option>
        {saved.places.map(place => <option key={place.id} value={place.id}>{place.name}</option>)}
      </select>
    </div>
    <div>
      <label htmlFor="alert-threshold" className="mb-2 block text-xs text-muted">{t("Alert when IPU reaches")}</label>
      <select id="alert-threshold" value={saved.threshold} onChange={event => saved.update({ threshold: Number(event.target.value) })} className="control w-full px-3">
        {ALERT_THRESHOLDS.map((value, index) => <option key={value} value={value}>{value}+ · {[t("Unhealthy"), t("Very unhealthy"), t("Hazardous")][index]}</option>)}
      </select>
    </div>
    <p className="text-xs leading-5 text-muted">{t("Checks fresh readings while this app is open and visible. No alerts after closing. Offline or outdated readings do not trigger alerts.")}</p>
    <div className="border-t border-line pt-5">
      <h3 className="text-sm font-medium">{t("Device notifications")}</h3>
      <p className="mt-2 text-xs leading-5 text-muted">{t("In-app alerts work without notification permission.")}</p>
      {saved.browserNotifications && notifications.permission === 'granted' ? <button type="button" onClick={() => saved.update({ browserNotifications: false })} className="secondary-button mt-3">{t("Turn off device notifications")}</button> : <button type="button" onClick={notifications.enableNotifications} disabled={!saved.alertsEnabled || !saved.places.length || notifications.busy || notifications.permission === 'unsupported' || notifications.permission === 'denied'} className="secondary-button mt-3">{t("Enable device notifications")}</button>}
      {notifications.permission === 'unsupported' && <p className="mt-3 text-xs leading-5 text-muted">{t("This browser does not support device notifications here. On iPhone, try the installed home-screen app.")}</p>}
      {notifications.permission === 'denied' && <p className="mt-3 text-xs leading-5 text-muted">{t("Notifications are blocked. Allow them in your browser or device settings to enable this option.")}</p>}
      <button type="button" onClick={notifications.test} disabled={notifications.busy || !saved.alertsEnabled || !saved.browserNotifications || notifications.permission !== 'granted'} className="secondary-button mt-3 block">{t("Send a test notification")}</button>
      {notifications.message && <p role="status" className="mt-3 text-xs leading-5 text-muted">{t(notifications.message)}</p>}
    </div>
  </div>
}
