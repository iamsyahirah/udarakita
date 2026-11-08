export const APP_PREFERENCES_KEY = 'udarakita:appearance:v1'

export function normalizeAppPreferences(value) {
  return { theme: ['dark', 'light', 'system'].includes(value?.theme) ? value.theme : 'dark', language: value?.language === 'ms' ? 'ms' : 'en' }
}

export function readAppPreferences() {
  try { return normalizeAppPreferences(JSON.parse(localStorage.getItem(APP_PREFERENCES_KEY))) }
  catch { return normalizeAppPreferences(null) }
}

export function resolveTheme(theme, systemDark) {
  return theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
}
