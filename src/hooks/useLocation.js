import { useEffect, useRef, useState } from 'react'
import { validCoordinates } from '../utils/places.js'

export default function useLocation() {
  const [position, setPosition] = useState(null)
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const request = useRef(0)
  const pending = useRef(false)
  useEffect(() => () => { request.current++; pending.current = false }, [])

  const locate = () => {
    if (pending.current) return
    setError('')
    if (!window.isSecureContext || !navigator.geolocation) {
      setError('Location is unavailable here. Open UdaraKita over HTTPS, or find a station using Filters.')
      return
    }
    const id = ++request.current
    pending.current = true
    setLocating(true)
    const fail = (message) => {
      if (id !== request.current) return
      pending.current = false
      setLocating(false)
      setError(message)
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (id !== request.current) return
      if (!validCoordinates(coords.latitude, coords.longitude)) return fail('Your device returned an invalid location. Please try again.')
      setPosition({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy })
      pending.current = false
      setLocating(false)
    }, (error) => {
      fail(error.code === 1 ? 'Location access was denied. Allow location in your browser or device settings, or use Filters.' : error.code === 3 ? 'Finding your location took too long. Try again outdoors or use Filters.' : 'Your location could not be found. Try again or use Filters.')
    }, { enableHighAccuracy: false, timeout: 15_000, maximumAge: 60_000 })
  }

  const clear = () => {
    request.current++
    pending.current = false
    setPosition(null)
    setLocating(false)
    setError('')
  }

  return { position, locating, error, locate, clear }
}
