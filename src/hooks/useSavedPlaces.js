import { useEffect, useRef, useState } from 'react'
import { MAX_SAVED_PLACES, SAVED_PLACES_KEY, normalizePreferences, readPreferences, writePreferences } from '../services/savedPlaces.js'

export default function useSavedPlaces() {
  const [initial] = useState(readPreferences)
  const [preferences, setPreferences] = useState(initial.preferences)
  const [message, setMessage] = useState(initial.error)
  const current = useRef(preferences)

  useEffect(() => {
    const sync = (event) => {
      if (event.key !== SAVED_PLACES_KEY && event.key !== null) return
      const next = readPreferences()
      current.current = next.preferences
      setPreferences(next.preferences)
      setMessage(next.error)
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const update = (changes, success = '') => {
    const next = normalizePreferences({ ...current.current, ...changes })
    try {
      writePreferences(next)
      current.current = next
      setPreferences(next)
      setMessage(success)
      return true
    } catch {
      setMessage('Changes could not be saved on this device. Check your browser’s storage settings.')
      return false
    }
  }

  const save = (station) => {
    if (current.current.places.some(place => place.id === station.id)) return true
    if (current.current.places.length >= MAX_SAVED_PLACES) {
      setMessage(`You can save up to ${MAX_SAVED_PLACES} locations. Remove one before adding another.`)
      return false
    }
    if (typeof station.id !== 'string' || !station.id || typeof station.name !== 'string' || !station.name.trim()) {
      setMessage('This station cannot be saved because its details are unavailable.')
      return false
    }
    return update({ places: [...current.current.places, { id: station.id, name: station.name, state: station.state }] }, `${station.name} saved on this device.`)
  }

  const remove = (id) => update({ places: current.current.places.filter(place => place.id !== id) }, 'Saved location removed.')
  return { ...preferences, message, update, save, remove, isSaved: id => preferences.places.some(place => place.id === id) }
}
