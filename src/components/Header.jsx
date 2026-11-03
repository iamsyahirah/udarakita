import { Wind } from 'lucide-react'

export default function Header() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-white/10 pb-6 sm:pb-8">
      <div className="flex min-w-0 items-center gap-3">
        <img src="/favicon.svg" alt="" className="size-11 shrink-0" />
        <div>
          <p className="text-xl font-semibold tracking-tight">UdaraKita<span className="text-lime">.</span></p>
          <p className="text-xs text-muted">Malaysia Air Quality Checker</p>
        </div>
      </div>
      <span className="hidden items-center gap-2 text-xs text-muted sm:inline-flex"><Wind size={16} aria-hidden="true" /> A shared view of our air</span>
    </header>
  )
}
