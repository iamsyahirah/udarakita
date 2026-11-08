import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchAirQuality } from '../services/hazeApi.js'

export default function useAirQuality() {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [nextRequestAt, setNextRequestAt] = useState(0)
  const [now, setNow] = useState(Date.now)
  const [notice, setNotice] = useState('')
  const active = useRef(null)
  const allowedAt = useRef(0)

  const load = useCallback(async () => {
    if (active.current || Date.now() < allowedAt.current) return
    const controller = new AbortController()
    active.current = controller
    setLoading(true)
    setError('')
    setNotice('')
    try {
      const data = await fetchAirQuality({ signal: controller.signal })
      if (controller.signal.aborted) return
      setResult(data)
      allowedAt.current = data.nextRequestAt
      setNotice(data.offline ? 'Showing saved readings while the connection is unavailable.' : 'Snapshot loaded. Observation times show when stations reported their readings.')
    } catch (error) {
      if (controller.signal.aborted) return
      setError(error.message || 'Unable to load station readings. Please try again later.')
      allowedAt.current = error.nextRequestAt ?? Date.now() + 30_000
    } finally {
      if (!controller.signal.aborted) {
        active.current = null
        setNextRequestAt(allowedAt.current)
        setNow(Date.now())
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    load()
    // Updates countdowns and freshness labels only. Never polls the API.
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => {
      clearInterval(timer)
      active.current?.abort()
      active.current = null
    }
  }, [load])

  return { result, error, loading, load, now, notice, waitSeconds: Math.max(0, Math.ceil((nextRequestAt - now) / 1000)) }
}
