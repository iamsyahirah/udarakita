import { useTranslation } from '../contexts/AppPreferences.jsx'
import { navigation } from './PwaBottomBar.jsx'

export default function Header({ page }) {
  const { t } = useTranslation()
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line pb-6 sm:pb-8">
      <a href="#home" aria-label={t("UdaraKita home")} className="flex min-w-0 items-center gap-3 no-underline">
        <img src="/favicon.svg" alt="" className="size-11 shrink-0" />
        <div>
          <p className="text-xl font-semibold tracking-tight">{t("UdaraKita")}<span className="text-accent">.</span></p>
          <p className="text-xs text-muted">{t("Malaysia Air Quality Checker")}</p>
        </div>
      </a>
      <nav aria-label={t("Main navigation")} className="flex items-center gap-1 sm:gap-2">
        {navigation.map(({ page: target, label, icon: Icon }) => <a key={target} href={`#${target}`} aria-current={page === target ? 'page' : undefined} aria-label={t(label)} className={`${target !== 'settings' ? 'hidden md:inline-flex' : 'inline-flex'} min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm ${page === target ? 'bg-lime/10 text-accent' : 'text-muted'}`}>
          <Icon size={18} aria-hidden="true" /><span className="hidden lg:inline">{t(label)}</span>
        </a>)}
      </nav>
    </header>
  )
}
