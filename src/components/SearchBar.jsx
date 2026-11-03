import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor="station-search" className="mb-2 block text-xs text-muted">Search stations</label>
      <div className="relative">
        <Search size={18} aria-hidden="true" className="pointer-events-none absolute top-4 left-4 text-muted" />
        <input id="station-search" type="search" value={value} onChange={event => onChange(event.target.value)} placeholder="Station name or state" className="control w-full py-3.5 pr-4 pl-11" />
      </div>
    </div>
  )
}
