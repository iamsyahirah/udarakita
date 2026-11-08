import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export default function usePwa() {
  const [standalone, setStandalone] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installMessage, setInstallMessage] = useState('')
  const [installing, setInstalling] = useState(false)
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW()

  useEffect(() => {
    const mode = window.matchMedia('(display-mode: standalone)')
    const updateMode = () => setStandalone(mode.matches || navigator.standalone === true)
    const offerInstall = (event) => { event.preventDefault(); setInstallPrompt(event) }
    const onInstalled = () => { setInstalled(true); setInstallPrompt(null); setInstallMessage('UdaraKita has been installed.') }
    updateMode()
    mode.addEventListener('change', updateMode)
    window.addEventListener('beforeinstallprompt', offerInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      mode.removeEventListener('change', updateMode)
      window.removeEventListener('beforeinstallprompt', offerInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const install = async () => {
    if (!installPrompt || installing) return
    setInstalling(true)
    try {
      await installPrompt.prompt()
      const choice = await installPrompt.userChoice
      setInstallMessage(choice.outcome === 'accepted' ? 'Installation requested. Follow your browser’s instructions.' : 'Installation dismissed. You can install later from your browser menu.')
    } catch {
      setInstallMessage('Use your browser menu to install UdaraKita.')
    } finally {
      setInstallPrompt(null)
      setInstalling(false)
    }
  }

  const update = async () => {
    try { await updateServiceWorker(true) }
    catch { setInstallMessage('The update could not be applied. Reconnect and try again.') }
  }

  return { standalone, installed, installPrompt, installMessage, installing, install, needRefresh, update, dismissUpdate: () => setNeedRefresh(false) }
}
