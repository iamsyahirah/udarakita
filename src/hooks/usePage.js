import { useEffect, useState } from 'react'
import { useTranslation } from '../contexts/AppPreferences.jsx'

export const settingsInfoPages = ['about-app', 'about-data', 'privacy', 'disclaimer']
const titles = {
  home: 'Malaysia Air Quality Checker', filters: 'Filters', places: 'Places', settings: 'Settings',
  'about-app': 'About this app', 'about-data': 'About the data', privacy: 'Privacy & your data', disclaimer: 'Disclaimer',
}
const pages = Object.keys(titles)
const currentPage = () => pages.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home'

export default function usePage() {
  const { t } = useTranslation()
  const [page, setPage] = useState(currentPage)
  useEffect(() => {
    const change = () => {
      if (pages.includes(location.hash.slice(1)) || !location.hash) setPage(currentPage())
    }
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])
  useEffect(() => {
    document.title = `${t(titles[page])} — UdaraKita`
  }, [page, t])
  useEffect(() => {
    window.scrollTo(0, 0)
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [page])
  return page
}
