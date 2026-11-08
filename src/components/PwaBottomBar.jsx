import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function PwaBottomBar() {
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)')
    const update = () => setStandalone(displayMode.matches || window.navigator.standalone === true)
    update()
    displayMode.addEventListener('change', update)
    return () => displayMode.removeEventListener('change', update)
  }, [])

  if (!standalone) return null

  const focusControl = (id) => {
    document.getElementById(id)?.focus({ preventScroll: true })
    document.getElementById('station-controls')?.scrollIntoView({ block: 'start' })
  }

  return (
    <div className="pwa-bottom-space">
      <nav aria-label="Station tools" className="pwa-bottom-bar">
        <div className="mx-auto flex max-w-lg gap-3">
          <button type="button" aria-controls="station-search" onClick={() => focusControl('station-search')} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3 text-sm font-medium text-ink">
            <Search size={18} aria-hidden="true" /> Search
          </button>
          <button type="button" aria-controls="state-filter" onClick={() => focusControl('state-filter')} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-medium">
            <SlidersHorizontal size={18} aria-hidden="true" /> Filter
          </button>
        </div>
      </nav>
    </div>
  )
}
