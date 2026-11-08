import { useEffect, useState } from 'react'
import { Download, MapPin, Bookmark, BellRing, Palette, Languages, Info, Database, LocateFixed, Check } from 'lucide-react'
import { clearSnapshot, readSnapshot } from '../services/offlineSnapshot.js'

const plannedSettings = [
  { icon: MapPin, title: 'Alert location', description: 'Choose the place to monitor for air quality alerts.' },
  { icon: Bookmark, title: 'Saved locations', description: 'Keep your favourite places close at hand.' },
  { icon: BellRing, title: 'Notifications & alerts', description: 'Set notification preferences and air quality thresholds.' },
  { icon: Palette, title: 'Theme', description: 'Choose how UdaraKita looks. Currently using Dark.' },
  { icon: Languages, title: 'Language', description: 'Choose your preferred language. Currently using English.' },
  { icon: Info, title: 'About the data', description: 'Learn about sources, index categories, and observation times.' },
]

export default function SettingsPage({ pwa, location, result }) {
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
    <div className="page-intro"><p className="eyebrow">Make yourself at home</p><h1 className="page-title">Settings</h1><p className="page-description">Manage the app on this device. More ways to make it yours are on the way.</p></div>
    <div className="grid items-start gap-7 lg:grid-cols-2">
      <div className="space-y-7">
        <section aria-labelledby="install-heading" className="settings-card">
          <div className="mb-4 flex items-center gap-3 text-lime">{installed ? <Check size={22} aria-hidden="true" /> : <Download size={22} aria-hidden="true" />}<h2 id="install-heading" className="text-lg font-medium text-[#f4f5ee]">Install the app</h2></div>
          {installed ? <p className="text-sm leading-6 text-muted">{pwa.standalone ? 'You’re using the installed UdaraKita app.' : 'UdaraKita has been installed. Open it from your home screen or app launcher.'}</p> : <>
            <p className="text-sm leading-6 text-muted">Add UdaraKita to your home screen for quick access and saved readings offline.</p>
            {pwa.installPrompt ? <button type="button" disabled={pwa.installing} onClick={pwa.install} className="action-button mt-5">{pwa.installing ? 'Opening installer…' : 'Install UdaraKita'}</button> : <div className="mt-5 rounded-2xl border border-white/10 p-4 text-sm leading-6">
              <p className="font-medium">Install from your browser</p>
              <p className="mt-2 text-muted">iPhone or iPad: open in Safari, tap Share, then Add to Home Screen.</p>
              <p className="mt-3 text-muted">Android, Chrome or Edge: open the browser menu and choose Install app or Add to Home screen when available.</p>
            </div>}
          </>}
          {pwa.installMessage && <p role="status" className="mt-4 text-sm leading-6 text-lime">{pwa.installMessage}</p>}
        </section>
        <section aria-labelledby="device-heading" className="settings-card">
          <h2 id="device-heading" className="mb-5 text-lg font-medium">On this device</h2>
          <div className="border-b border-white/10 pb-5">
            <div className="flex items-center gap-3"><Database size={18} aria-hidden="true" className="text-lime" /><h3 className="font-medium">Offline readings</h3></div>
            <p className="mt-3 text-sm leading-6 text-muted">{snapshot ? 'A saved snapshot is available for offline use.' : 'No saved readings on this device yet.'}</p>
            <button type="button" onClick={removeSnapshot} disabled={!snapshot} className="secondary-button mt-4">Clear saved readings</button>
            {storageMessage && <p role="status" className="mt-3 text-sm leading-6 text-muted">{storageMessage}</p>}
          </div>
          <div className="pt-5">
            <div className="flex items-center gap-3"><LocateFixed size={18} aria-hidden="true" className="text-lime" /><h3 className="font-medium">Current location</h3></div>
            <p className="mt-3 text-sm leading-6 text-muted">{location.position ? 'A GPS position is being used to find nearby stations in this session.' : location.locating ? 'A location request is in progress.' : 'No GPS position is held in this session. Use Places to find nearby stations.'}</p>
            <button type="button" disabled={!location.position && !location.locating} onClick={() => { location.clear(); setLocationMessage('Your current position has been forgotten. Browser location permission is managed in your device settings.') }} className="secondary-button mt-4">Forget current location</button>
            <a href="#places" className="mt-3 block text-sm text-lime">Explore nearby stations →</a>
            {locationMessage && <p role="status" className="mt-3 text-sm leading-6 text-muted">{locationMessage}</p>}
          </div>
        </section>
      </div>
      <section aria-labelledby="preferences-heading" className="settings-card">
        <h2 id="preferences-heading" className="mb-2 text-lg font-medium">Preferences & information</h2>
        <p className="mb-3 text-sm leading-6 text-muted">These options are planned for a future update.</p>
        <ul className="divide-y divide-white/10">{plannedSettings.map(({ icon: Icon, title, description }) => <li key={title} className="py-5">
          <div className="flex items-start gap-3"><Icon size={19} aria-hidden="true" className="mt-1 shrink-0 text-muted" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-3 gap-y-2"><h3 className="text-sm font-medium">{title}</h3><span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-muted">Coming later</span></div><p className="mt-2 text-xs leading-5 text-muted">{description}</p></div></div>
        </li>)}</ul>
      </section>
    </div>
  </>
}
