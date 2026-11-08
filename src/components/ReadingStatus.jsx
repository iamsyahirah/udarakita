import { useTranslation } from '../contexts/AppPreferences.jsx'
import { freshnessMessage } from '../utils/stations.js'

export default function ReadingStatus({ airQuality }) {
  const { t, locale } = useTranslation()
  const { result, error, loading, now } = airQuality
  const freshness = freshnessMessage(result, now)
  return <>
    {!result && loading && <p role="status" className="notice">{t("Loading station readings…")}</p>}
    {error && <p role="alert" className="notice">{t(error)}{result && " " + t("Showing the previously loaded snapshot; observations have not been updated.")}</p>}
    {result?.offline && <p role="status" className="notice">{t("Connection unavailable. Showing saved readings from")} {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(result.savedAt)} {t("MYT. These are not live readings. Go online and refresh to update them.")}</p>}
    {freshness && <p role="status" className="notice">{t(freshness)}</p>}
  </>
}
