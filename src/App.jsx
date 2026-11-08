import { useTranslation } from './contexts/AppPreferences.jsx'
import { useState } from 'react'
import Header from './components/Header.jsx'
import SettingsInfoPage from './components/SettingsInfoPage.jsx'
import Dashboard from './components/Dashboard.jsx'
import PlacesPage from './components/PlacesPage.jsx'
import SettingsPage from './components/SettingsPage.jsx'
import PwaControls from './components/PwaControls.jsx'
import PwaBottomBar from './components/PwaBottomBar.jsx'
import useAirQuality from './hooks/useAirQuality.js'
import usePwa from './hooks/usePwa.js'
import usePage, { settingsInfoPages } from './hooks/usePage.js'
import useLocation from './hooks/useLocation.js'
import useSavedPlaces from './hooks/useSavedPlaces.js'
import useIpuAlerts from './hooks/useIpuAlerts.js'

export default function App() {
  const { t } = useTranslation()
  const savedPlaces = useSavedPlaces()
  const airQuality = useAirQuality({ autoRefresh: savedPlaces.alertsEnabled && savedPlaces.places.length > 0 })
  const notifications = useIpuAlerts(airQuality, savedPlaces)
  const pwa = usePwa()
  const page = usePage()
  const navigationPage = settingsInfoPages.includes(page) ? 'settings' : page
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [state, setState] = useState('')

  return <div className="mx-auto max-w-6xl px-5 py-7 sm:px-10 sm:py-10">
    <a href="#main-content" className="skip-link">{t("Skip to content")}</a>
    <Header page={navigationPage} />
    {savedPlaces.message && <p role="status" className="mt-5 text-sm leading-6 text-accent">{t(savedPlaces.message)}</p>}
    {notifications.alerts.length > 0 && <div role="alert" className="notice mt-5">
      <p className="font-medium">{t("High IPU at your saved locations")}</p>
      <ul className="mt-2">{notifications.alerts.map(alert => <li key={alert.key}>{alert.name}{t(": IPU")} {alert.api} {t("· threshold")} {savedPlaces.threshold}+</li>)}</ul>
      <a href="#places" className="mt-2 inline-block underline">{t("View saved locations")}</a>
    </div>}
    <main id="main-content" tabIndex={-1} className="outline-none">
      {(page === 'home' || page === 'filters') && <Dashboard airQuality={airQuality} query={query} setQuery={setQuery} state={state} setState={setState} savedPlaces={savedPlaces} filtersPage={page === 'filters'} />}
      {page === 'places' && <PlacesPage airQuality={airQuality} location={location} savedPlaces={savedPlaces} />}
      {page === 'settings' && <SettingsPage pwa={pwa} location={location} result={airQuality.result} savedPlaces={savedPlaces} notifications={notifications} />}
      {settingsInfoPages.includes(page) && <SettingsInfoPage page={page} />}
    </main>
    <PwaControls pwa={pwa} />
    <PwaBottomBar page={navigationPage} />
  </div>
}
