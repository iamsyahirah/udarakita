import { useState } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Dashboard from './components/Dashboard.jsx'
import PlacesPage from './components/PlacesPage.jsx'
import SettingsPage from './components/SettingsPage.jsx'
import PwaControls from './components/PwaControls.jsx'
import PwaBottomBar from './components/PwaBottomBar.jsx'
import useAirQuality from './hooks/useAirQuality.js'
import usePwa from './hooks/usePwa.js'
import usePage from './hooks/usePage.js'
import useLocation from './hooks/useLocation.js'

export default function App() {
  const airQuality = useAirQuality()
  const pwa = usePwa()
  const page = usePage()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [state, setState] = useState('')

  return <div className="mx-auto max-w-6xl px-5 py-7 sm:px-10 sm:py-10">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <Header page={page} />
    <main id="main-content" tabIndex={-1} className="outline-none">
      {(page === 'home' || page === 'filters') && <Dashboard airQuality={airQuality} query={query} setQuery={setQuery} state={state} setState={setState} filtersPage={page === 'filters'} />}
      {page === 'places' && <PlacesPage airQuality={airQuality} location={location} />}
      {page === 'settings' && <SettingsPage pwa={pwa} location={location} result={airQuality.result} />}
    </main>
    <PwaControls pwa={pwa} />
    <Footer />
    <PwaBottomBar page={page} />
  </div>
}
