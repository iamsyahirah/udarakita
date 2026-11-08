import { useTranslation } from '../contexts/AppPreferences.jsx'
export default function PwaControls({ pwa }) {
  const { t } = useTranslation()
  if (!pwa.needRefresh) return null
  return <aside aria-label={t("App update")} className="mt-8 rounded-2xl bg-panel p-5 text-sm leading-6">
    <div role="status" className="flex flex-wrap items-center gap-3">
      <p>{t("A new version of UdaraKita is ready.")}</p>
      <button type="button" onClick={pwa.update} className="action-button">{t("Update app")}</button>
      <button type="button" onClick={pwa.dismissUpdate} className="secondary-button">{t("Later")}</button>
    </div>
    {pwa.installMessage && <p role="status" className="mt-3">{t(pwa.installMessage)}</p>}
  </aside>
}
