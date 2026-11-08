import { useTranslation } from '../contexts/AppPreferences.jsx'
import { useEffect, useState } from 'react'
import { Download, MapPin, Bookmark, BellRing, Palette, Languages, Info, Database, Check, ChevronRight, ShieldCheck, FileText, Wind } from 'lucide-react'
import { clearSnapshot, readSnapshot } from '../services/offlineSnapshot.js'
import SavedLocationsEditor from './SavedLocationsEditor.jsx'
import AlertPreferences from './AlertPreferences.jsx'

function SettingsGroup({ id, title, children }) {
  return <section aria-labelledby={id} className="settings-group">
    <h2 id={id} className="settings-group-title">{title}</h2>
    <div className="settings-rows">{children}</div>
  </section>
}

function SettingsRow({ icon: Icon, tone = 'mint', title, description, planned = false, action, href }) {
  const { t } = useTranslation()
  const Row = href ? 'a' : 'div'
  return <Row className={`settings-row${href ? ' settings-link' : ''}`} href={href} aria-label={href ? title : undefined}>
    <span className={`settings-icon settings-icon-${tone}`}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
    <div className="min-w-0 flex-1">
      <h3 className="settings-row-title">{title}</h3>
      <p className="settings-row-description">{description}</p>
      {planned && <span className="settings-planned">{t("Coming later")}</span>}
    </div>
    {(action || href) && <div className="settings-row-action">{action || <ChevronRight size={19} aria-hidden="true" className="text-muted" />}</div>}
  </Row>
}

export default function SettingsPage({ pwa, location, result, savedPlaces, notifications }) {
  const { t, theme, language, updateAppearance, preferenceMessage } = useTranslation()
  const [snapshot, setSnapshot] = useState(readSnapshot)
  const [storageMessage, setStorageMessage] = useState('')
  const [locationMessage, setLocationMessage] = useState('')
  const installed = pwa.standalone || pwa.installed
  useEffect(() => { setSnapshot(readSnapshot()) }, [result])

  const removeSnapshot = () => {
    if (clearSnapshot()) {
      setSnapshot(null)
      setStorageMessage('Saved readings cleared. Currently loaded readings stay visible; the next successful refresh will save a new snapshot.')
    } else setStorageMessage('Saved readings could not be cleared. Check your browser’s storage settings.')
  }

  return <>
    <div className="settings-intro"><h1 className="page-title">{t("Settings")}</h1></div>
    <div className="settings-layout">
      <SettingsGroup id="alert-locations-heading" title={t("Saved locations")}>
        <SettingsRow icon={Bookmark} title={t("Saved locations")} description={t("Keep your monitoring stations on this device.")} />
        <SavedLocationsEditor saved={savedPlaces} stations={result?.stations ?? []} />
      </SettingsGroup>

      <SettingsGroup id="notifications-heading" title={t("Notifications and alerts")}>
        <SettingsRow icon={BellRing} tone="lavender" title={t("High-IPU alerts")} description={t("Watch one station or all your saved locations.")} />
        <AlertPreferences saved={savedPlaces} notifications={notifications} />
      </SettingsGroup>

      <SettingsGroup id="preferences-heading" title={t("Appearance and language")}>
        <SettingsRow icon={Palette} tone="lavender" title={t('Theme')} description={t('Choose dark, light, or follow your device.')} />
        <div className="settings-row-extra">
          <label htmlFor="app-theme" className="mb-2 block text-xs text-muted">{t('Choose theme')}</label>
          <select id="app-theme" value={theme} onChange={event => updateAppearance({ theme: event.target.value })} className="control w-full px-3">
            <option value="dark">{t('Dark')}</option><option value="light">{t('Light')}</option><option value="system">{t('System')}</option>
          </select>
        </div>
        <SettingsRow icon={Languages} title={t('Language')} description={t('Choose English or Bahasa Melayu.')} />
        <div className="settings-row-extra">
          <label htmlFor="app-language" className="mb-2 block text-xs text-muted">{t('Choose language')}</label>
          <select id="app-language" value={language} onChange={event => updateAppearance({ language: event.target.value })} className="control w-full px-3">
            <option value="en" lang="en">English</option><option value="ms" lang="ms">Bahasa Melayu</option>
          </select>
          {preferenceMessage && <p role="status" className="mt-3 text-xs leading-5 text-muted">{t(preferenceMessage)}</p>}
        </div>
      </SettingsGroup>

      <SettingsGroup id="app-heading" title={t("The app")}>
        <SettingsRow icon={installed ? Check : Download} title={t("Install the app")} description={installed ? (pwa.standalone ? t("You’re using the installed UdaraKita app.") : t("UdaraKita has been installed. Open it from your home screen or app launcher.")) : t("Keep UdaraKita on your home screen.")} />
        {!installed && <div className="settings-row-extra">
          {pwa.installPrompt ? <button type="button" disabled={pwa.installing} onClick={pwa.install} className="action-button">{pwa.installing ? t("Opening installer…") : t("Install UdaraKita")}</button> : <details className="install-instructions">
            <summary>{t("Install from your browser")} <ChevronRight size={16} aria-hidden="true" /></summary>
            <p>{t("iPhone or iPad: open in Safari, tap Share, then Add to Home Screen.")}</p>
            <p>{t("Android, Chrome or Edge: open the browser menu and choose Install app or Add to Home screen when available.")}</p>
          </details>}
        </div>}
        {pwa.installMessage && <p role="status" className="settings-group-note">{t(pwa.installMessage)}</p>}
      </SettingsGroup>

      <SettingsGroup id="about-heading" title={t("About")}>
        <SettingsRow icon={Wind} title={t("About this app")} description={t("Get to know UdaraKita.")} href="#about-app" />
        <SettingsRow icon={Info} tone="lavender" title={t("About the data")} description={t("Sources, observation times and credits.")} href="#about-data" />
        <SettingsRow icon={ShieldCheck} title={t("Privacy & your data")} description={t("Location, offline storage and connections.")} href="#privacy" />
        <SettingsRow icon={FileText} tone="lavender" title={t("Disclaimer")} description={t("What to know when using the readings.")} href="#disclaimer" />
      </SettingsGroup>

      <SettingsGroup id="device-heading" title={t("On this device")}>
        <SettingsRow icon={Database} title={t("Offline readings")} description={snapshot ? t("A saved snapshot is available for offline use.") : t("No saved readings on this device yet.")} />
        <div className="settings-row-extra"><button type="button" onClick={removeSnapshot} disabled={!snapshot} className="secondary-button">{t("Clear saved readings")}</button></div>
        {storageMessage && <p role="status" className="settings-group-note">{t(storageMessage)}</p>}
        <SettingsRow icon={MapPin} tone="lavender" title={t("Current location")} description={location.position ? t("Used to find nearby stations in this session.") : location.locating ? t("Finding your location…") : t("Use Places to find stations near you.")} />
        <div className="settings-row-extra flex flex-wrap items-center gap-3">
          <button type="button" disabled={!location.position && !location.locating} onClick={() => { location.clear(); setLocationMessage('Your current position has been forgotten. Browser location permission is managed in your device settings.') }} className="secondary-button">{t("Forget current location")}</button>
          <a href="#places" className="inline-flex min-h-11 items-center gap-1 text-sm text-accent">{t("Open Places")} <ChevronRight size={15} aria-hidden="true" /></a>
        </div>
        {locationMessage && <p role="status" className="settings-group-note">{t(locationMessage)}</p>}
      </SettingsGroup>
    </div>
  </>
}
