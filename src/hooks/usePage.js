import { useEffect, useState } from 'react'

const pages = ['home', 'filters', 'places', 'settings']
const currentPage = () => pages.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home'

export default function usePage() {
  const [page, setPage] = useState(currentPage)
  useEffect(() => {
    const change = () => {
      if (pages.includes(location.hash.slice(1)) || !location.hash) setPage(currentPage())
    }
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])
  useEffect(() => {
    document.title = `${page === 'home' ? 'Malaysia Air Quality Checker' : page[0].toUpperCase() + page.slice(1)} — UdaraKita`
    window.scrollTo(0, 0)
    document.getElementById('main-content')?.focus({ preventScroll: true })
  }, [page])
  return page
}
