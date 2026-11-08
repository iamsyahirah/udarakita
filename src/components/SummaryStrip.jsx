import { useTranslation } from '../contexts/AppPreferences.jsx'
import { Clock3, Radio } from 'lucide-react'
import { latestObservation, observationTime } from '../utils/airQuality.js'

export default function SummaryStrip({ stations }) {
  const { t, locale } = useTranslation()
  const latest = latestObservation(stations)
  return (
    <section aria-label={t("Station overview")} className="mb-12 grid gap-4 sm:grid-cols-2">
      <div className="rounded-[26px] bg-lime p-6 text-ink sm:p-7">
        <p className="mb-5 flex items-center gap-2 text-sm"><Radio size={17} aria-hidden="true" /> {t("Stations returned")}</p>
        <p className="text-5xl font-medium tracking-tight">{stations.length}</p>
        <p className="mt-3 text-sm">{t("Monitoring stations in this snapshot")}</p>
      </div>
      <div className="rounded-[26px] bg-lavender p-6 text-ink sm:p-7">
        <p className="mb-5 flex items-center gap-2 text-sm"><Clock3 size={17} aria-hidden="true" /> {t("Latest observation")}</p>
        {latest ? <p className="text-2xl leading-8 font-medium tracking-tight"><time dateTime={latest}>{observationTime(latest, locale)}</time><span className="ml-2 text-sm font-normal">{t("MYT")}</span></p> : <p className="text-2xl">{t("Unavailable")}</p>}
        <p className="mt-3 text-sm">{latest ? t("Latest available station observation") : t("No valid station observation times returned")}</p>
      </div>
    </section>
  )
}
