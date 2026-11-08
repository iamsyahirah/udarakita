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
  const Row = href ? 'a' : 'div'
  return <Row className={`settings-row${href ? ' settings-link' : ''}`} href={href} aria-label={href ? title : undefined}>
    <span className={`settings-icon settings-icon-${tone}`}><Icon size={22} strokeWidth={1.7} aria-hidden="true" /></span>
    <div className="min-w-0 flex-1">
      <h3 className="settings-row-title">{title}</h3>
      <p className="settings-row-description">{description}</p>
      {planned && <span className="settings-planned">Coming later</span>}
    </div>
    {(action || href) && <div className="settings-row-action">{action || <ChevronRight size={19} aria-hidden="true" className="text-muted" />}</div>}
  </Row>
}

export default function SettingsPage({ pwa, location, result, savedPlaces, notifications }) {
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
    <div className="settings-intro"><h1 className="page-title">Settings</h1></div>
    <div className="settings-layout">
      <SettingsGroup id="alert-locations-heading" title="Saved locations">
        <SettingsRow icon={Bookmark} title="Saved locations" description="Keep your monitoring stations on this device." />
        <SavedLocationsEditor saved={savedPlaces} stations={result?.stations ?? []} />
      </SettingsGroup>

      <SettingsGroup id="notifications-heading" title="Notifications and alerts">
        <SettingsRow icon={BellRing} tone="lavender" title="High-IPU alerts" description="Watch one station or all your saved locations." />
        <AlertPreferences saved={savedPlaces} notifications={notifications} />
      </SettingsGroup>

      <SettingsGroup id="preferences-heading" title="Appearance and language">
        <SettingsRow icon={Palette} tone="lavender" title="Theme" description="Dark · more options on the way" planned />
        <SettingsRow icon={Languages} title="Language" description="English · more languages on the way" planned />
      </SettingsGroup>

      <SettingsGroup id="app-heading" title="The app">
        <SettingsRow icon={installed ? Check : Download} title="Install the app" description={installed ? (pwa.standalone ? 'You’re using the installed UdaraKita app.' : 'UdaraKita has been installed. Open it from your home screen or app launcher.') : 'Keep UdaraKita on your home screen.'} />
        {!installed && <div className="settings-row-extra">
          {pwa.installPrompt ? <button type="button" disabled={pwa.installing} onClick={pwa.install} className="action-button">{pwa.installing ? 'Opening installer…' : 'Install UdaraKita'}</button> : <details className="install-instructions">
            <summary>Install from your browser <ChevronRight size={16} aria-hidden="true" /></summary>
            <p>iPhone or iPad: open in Safari, tap Share, then Add to Home Screen.</p>
            <p>Android, Chrome or Edge: open the browser menu and choose Install app or Add to Home screen when available.</p>
          </details>}
        </div>}
        {pwa.installMessage && <p role="status" className="settings-group-note">{pwa.installMessage}</p>}
      </SettingsGroup>

      <SettingsGroup id="about-heading" title="About">
        <SettingsRow icon={Wind} title="About this app" description="Get to know UdaraKita." href="#about-app" />
        <SettingsRow icon={Info} tone="lavender" title="About the data" description="Sources, observation times and credits." href="#about-data" />
        <SettingsRow icon={ShieldCheck} title="Privacy & your data" description="Location, offline storage and connections." href="#privacy" />
        <SettingsRow icon={FileText} tone="lavender" title="Disclaimer" description="What to know when using the readings." href="#disclaimer" />
      </SettingsGroup>

      <SettingsGroup id="device-heading" title="On this device">
        <SettingsRow icon={Database} title="Offline readings" description={snapshot ? 'A saved snapshot is available for offline use.' : 'No saved readings on this device yet.'} />
        <div className="settings-row-extra"><button type="button" onClick={removeSnapshot} disabled={!snapshot} className="secondary-button">Clear saved readings</button></div>
        {storageMessage && <p role="status" className="settings-group-note">{storageMessage}</p>}
        <SettingsRow icon={MapPin} tone="lavender" title="Current location" description={location.position ? 'Used to find nearby stations in this session.' : location.locating ? 'Finding your location…' : 'Use Places to find stations near you.'} />
        <div className="settings-row-extra flex flex-wrap items-center gap-3">
          <button type="button" disabled={!location.position && !location.locating} onClick={() => { location.clear(); setLocationMessage('Your current position has been forgotten. Browser location permission is managed in your device settings.') }} className="secondary-button">Forget current location</button>
          <a href="#places" className="inline-flex min-h-11 items-center gap-1 text-sm text-lime">Open Places <ChevronRight size={15} aria-hidden="true" /></a>
        </div>
        {locationMessage && <p role="status" className="settings-group-note">{locationMessage}</p>}
      </SettingsGroup>
    </div>
  </>
}
