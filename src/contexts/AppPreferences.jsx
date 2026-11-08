import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { APP_PREFERENCES_KEY, normalizeAppPreferences, readAppPreferences, resolveTheme } from '../services/appPreferences.js'
import { translate } from '../i18n/translations.js'

const PreferencesContext = createContext(null)

export function AppPreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(readAppPreferences)
  const [systemDark, setSystemDark] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  const [preferenceMessage, setPreferenceMessage] = useState('')
  const current = useRef(preferences)
  current.current = preferences
  const resolvedTheme = resolveTheme(preferences.theme, systemDark)
  const locale = preferences.language === 'ms' ? 'ms-MY' : 'en-MY'
  const t = useCallback((text, values) => translate(text, preferences.language, values), [preferences.language])

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const update = () => setSystemDark(media.matches)
    media.addEventListener('change', update)
    const sync = event => {
      if (event.key === APP_PREFERENCES_KEY || event.key === null) {
        const next = readAppPreferences()
        current.current = next
        setPreferences(next)
        setPreferenceMessage('')
      }
    }
    window.addEventListener('storage', sync)
    return () => { media.removeEventListener('change', update); window.removeEventListener('storage', sync) }
  }, [])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme
    document.documentElement.style.colorScheme = resolvedTheme
    document.documentElement.lang = preferences.language
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolvedTheme === 'dark' ? '#101210' : '#f3f5f0')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('Check the latest available air quality readings across Malaysia.'))
  }, [resolvedTheme, preferences.language, t])

  const updateAppearance = useCallback(changes => {
    const next = normalizeAppPreferences({ ...current.current, ...changes })
    current.current = next
    setPreferences(next)
    try { localStorage.setItem(APP_PREFERENCES_KEY, JSON.stringify(next)); setPreferenceMessage('') }
    catch { setPreferenceMessage('Preference applied for this session. Your browser could not save it.') }
  }, [])

  const value = useMemo(() => ({ ...preferences, resolvedTheme, locale, t, preferenceMessage, updateAppearance }), [preferences, resolvedTheme, locale, t, preferenceMessage, updateAppearance])
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function useTranslation() {
  return useContext(PreferencesContext)
}
