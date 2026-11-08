import { useTranslation } from '../contexts/AppPreferences.jsx'
import { useId, useState } from 'react'
import { Share2 } from 'lucide-react'

export default function ShareApp() {
  const { t } = useTranslation()
  const id = useId()
  const [sharing, setSharing] = useState(false)
  const [message, setMessage] = useState('')
  const [manualUrl, setManualUrl] = useState('')

  const share = async () => {
    if (sharing) return
    setSharing(true)
    setMessage('')
    setManualUrl('')
    // Share the app itself, without location, filters, or other URL parameters.
    const url = new URL(import.meta.env.BASE_URL, window.location.origin).href
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: 'UdaraKita', text: t('Check air quality across Malaysia with UdaraKita.'), url })
          setMessage('Share completed.')
          return
        } catch (error) {
          if (error.name === 'AbortError') {
            setMessage('Sharing cancelled.')
            return
          }
        }
      }
      try {
        if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
        await navigator.clipboard.writeText(url)
        setMessage('App link copied. Paste it into a message to share.')
      } catch {
        setManualUrl(url)
        setMessage('Copy the app link below to share it.')
      }
    } finally {
      setSharing(false)
    }
  }

  return <div>
    <button type="button" onClick={share} disabled={sharing} className="action-button inline-flex items-center gap-2"><Share2 size={17} aria-hidden="true" />{sharing ? t("Sharing…") : t("Share app")}</button>
    {message && <p role="status" className="mt-3 text-sm leading-6 text-muted">{t(message)}</p>}
    {manualUrl && <div className="mt-3">
      <label htmlFor={id} className="mb-2 block text-xs text-muted">{t("App link")}</label>
      <input id={id} type="text" readOnly value={manualUrl} onFocus={event => event.target.select()} className="control w-full px-3 py-2 text-sm" />
    </div>}
  </div>
}
