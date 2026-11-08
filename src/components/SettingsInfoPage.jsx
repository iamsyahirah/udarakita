import { useTranslation } from '../contexts/AppPreferences.jsx'
import { ArrowLeft, Wind } from 'lucide-react'
import { version } from '../../package.json'
import DataAttribution from './DataAttribution.jsx'
import ShareApp from './ShareApp.jsx'

const titles = { 'about-app': 'About this app', 'about-data': 'About the data', privacy: 'Privacy & your data', disclaimer: 'Disclaimer' }

function InfoCard({ title, children }) {
  return <section className="info-card"><h2>{title}</h2>{children}</section>
}

export default function SettingsInfoPage({ page }) {
  const { t } = useTranslation()
  return <>
    <div className="settings-intro">
      <a href="#settings" className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-accent"><ArrowLeft size={17} aria-hidden="true" />{t("Back to Settings")}</a>
      <h1 className="page-title">{t(titles[page])}</h1>
    </div>
    <div className="info-layout">
      {page === 'about-app' && <>
        <InfoCard title={t("A little clarity in the air")}>
          <Wind size={30} aria-hidden="true" className="my-5 text-accent" />
          <p>{t("UdaraKita helps you check the latest available air quality readings from monitoring stations across Malaysia.")}</p>
          <p>{t("Search by station or state, find stations near you, and revisit saved readings when you’re offline.")}</p>
          <p className="text-xs">{t("UdaraKita · Version")} {version}</p>
        </InfoCard>
        <InfoCard title={t("Share UdaraKita")}>
          <p>{t("Help someone find their local station. Sharing includes only the app link.")}</p>
          <div className="mt-5"><ShareApp /></div>
        </InfoCard>
        <InfoCard title={t("Learn more")}>
          <nav aria-label={t("App information")} className="flex flex-col items-start gap-3">
            <a href="#about-data">{t("About the data →")}</a>
            <a href="#privacy">{t("Privacy & your data →")}</a>
            <a href="#disclaimer">{t("Disclaimer →")}</a>
          </nav>
        </InfoCard>
      </>}
      {page === 'about-data' && <>
        <InfoCard title={t("The readings")}>
          <p>{t("Malaysia’s Air Pollutant Index (API / IPU), reported by monitoring stations. Times are shown in MYT.")}</p>
          <p>{t("Readings may be delayed. Offline snapshots are labelled; GPS finds nearby stations, not the air quality at your exact position.")}</p>
        </InfoCard>
        <DataAttribution />
      </>}
      {page === 'privacy' && <InfoCard title={t("Your data stays yours")}>
        <p>{t("GPS stays in memory on your device. We don’t save or send your coordinates to our server.")}</p>
        <p>{t("Saved station names, app and alert preferences, notification history and offline readings stay on this device. Remove saved places or readings in Settings; your browser’s site-data controls clear all app data.")}</p>
        <p>{t("No account or analytics scripts. Hosting and external services, including the MakaKami badge, may receive connection details under their own policies.")}</p>
      </InfoCard>}
      {page === 'disclaimer' && <InfoCard title={t("For general information")}>
        <p>{t("UdaraKita is an independent viewer, not an official service or medical advice.")}</p>
        <p>{t("Station readings may be delayed, incomplete, or different from conditions where you are. Alerts check fresh readings only while the app is open. They are not an emergency warning service.")}</p>
        <p>{t("Follow official Malaysian guidance for health and safety decisions.")}</p>
        <a href="https://www.doe.gov.my/">{t("Visit DOE / JAS →")}</a>
      </InfoCard>}
    </div>
  </>
}
