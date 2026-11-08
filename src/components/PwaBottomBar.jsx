import { House, SlidersHorizontal, MapPin, Settings } from 'lucide-react'

export const navigation = [
  { page: 'home', label: 'Home', icon: House },
  { page: 'filters', label: 'Filters', icon: SlidersHorizontal },
  { page: 'places', label: 'Places', icon: MapPin },
  { page: 'settings', label: 'Settings', icon: Settings },
]

export default function PwaBottomBar({ page, standalone }) {
  if (!standalone) return null
  return <div className="pwa-bottom-space md:hidden">
    <nav aria-label="App navigation" className="pwa-bottom-bar md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
        {navigation.map(({ page: target, label, icon: Icon }) => <a key={target} href={`#${target}`} aria-current={page === target ? 'page' : undefined} className={`bottom-nav-link ${page === target ? 'bg-lime/10 text-lime' : 'text-muted'}`}>
          <Icon size={21} aria-hidden="true" strokeWidth={page === target ? 2.2 : 1.7} /><span>{label}</span>
        </a>)}
      </div>
    </nav>
  </div>
}
