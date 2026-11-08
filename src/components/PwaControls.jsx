import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function PwaControls() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installError, setInstallError] = useState('')
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW()

  useEffect(() => {
    const offerInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const installed = () => setInstallPrompt(null)
    window.addEventListener('beforeinstallprompt', offerInstall)
    window.addEventListener('appinstalled', installed)
    return () => {
      window.removeEventListener('beforeinstallprompt', offerInstall)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])

  const install = async () => {
    try {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallError('')
    } catch {
      setInstallError('Use your browser menu to install UdaraKita.')
    } finally {
      setInstallPrompt(null)
    }
  }

  if (!installPrompt && !needRefresh && !installError) return null

  return (
    <aside aria-label="UdaraKita app" className="mt-8 rounded-2xl bg-panel p-5 text-sm leading-6">
      {installPrompt && <div className="flex flex-wrap items-center justify-between gap-3">
        <p>Keep UdaraKita handy on your home screen.</p>
        <button type="button" onClick={install} className="rounded-xl bg-lime px-4 py-3 font-medium text-ink">Install app</button>
      </div>}
      {installError && <p role="status">{installError}</p>}
      {needRefresh && <div role="status" className="flex flex-wrap items-center gap-3">
        <p>A new version of UdaraKita is ready.</p>
        <button type="button" onClick={() => updateServiceWorker(true)} className="rounded-xl bg-lime px-4 py-3 font-medium text-ink">Update app</button>
        <button type="button" onClick={() => setNeedRefresh(false)} className="rounded-xl border border-white/20 px-4 py-3">Later</button>
      </div>}
    </aside>
  )
}
