import { useTranslation } from '../contexts/AppPreferences.jsx'
import { ArrowUpRight } from 'lucide-react'

export default function DataAttribution() {
  const { t, resolvedTheme } = useTranslation()
  return (
    <section aria-label={t("Data sources and credits")} className="info-card">
      <h2>{t("Sources & credits")}</h2>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:gap-10">
        <p className="max-w-lg">{t("Data: Haze Monitor, using Department of Environment (DOE / JAS) observations.")}</p>
        <nav aria-label={t("Data sources")} className="flex shrink-0 flex-wrap items-start gap-5">
          <a className="inline-flex items-center gap-1" href="https://hazemonitor.com/developers">{t("Haze Monitor")} <ArrowUpRight size={13} aria-hidden="true" /></a>
          <a className="inline-flex items-center gap-1" href="https://www.doe.gov.my/">{t("DOE / JAS")} <ArrowUpRight size={13} aria-hidden="true" /></a>
        </nav>
      </div>
      <p className="mt-4"><a href="#disclaimer" className="text-accent">{t("Read the disclaimer →")}</a></p>
      <p className="mt-5">{t("Developed by")} <span className="font-medium text-accent">{t("Syahirah")}</span></p>
      <a className="mt-4 inline-block" href="https://makakami.com.my/app/udara-kita">
        <img
          src={`https://makakami.com.my/badge/udara-kita.svg?theme=${resolvedTheme}`}
          alt={t("Listed on MakaKami")}
          width="150"
          height="40"
          loading="lazy"
        />
      </a>
    </section>
  )
}
