import { ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-white/10 pt-7 text-xs leading-6 text-muted">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:gap-10">
        <p className="max-w-lg">Data provided by Haze Monitor; Malaysian observations sourced from the Department of Environment (DOE/JAS).</p>
        <nav aria-label="Data sources" className="flex shrink-0 flex-wrap items-start gap-5">
          <a className="inline-flex items-center gap-1" href="https://hazemonitor.com/developers">Haze Monitor <ArrowUpRight size={13} aria-hidden="true" /></a>
          <a className="inline-flex items-center gap-1" href="https://www.doe.gov.my/">DOE / JAS <ArrowUpRight size={13} aria-hidden="true" /></a>
        </nav>
      </div>
      <p className="mt-4">For official public-health advice, consult relevant Malaysian authorities.</p>
    </footer>
  )
}
