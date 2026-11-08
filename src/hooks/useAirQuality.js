import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchAirQuality } from '../services/hazeApi.js'

export default function useAirQuality({ autoRefresh = false } = {}) {
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [nextRequestAt, setNextRequestAt] = useState(0)
  const [now, setNow] = useState(Date.now)
  const [notice, setNotice] = useState('')
  const active = useRef(null)
  const allowedAt = useRef(0)
  const lastRequestAt = useRef(0)

  const load = useCallback(async () => {
    if (active.current || Date.now() < allowedAt.current) return
    const controller = new AbortController()
    active.current = controller
    lastRequestAt.current = Date.now()
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

  useEffect(() => {
    if (!autoRefresh || loading) return
    let timer
    const schedule = () => {
      clearTimeout(timer)
      if (document.visibilityState !== 'visible' || navigator.onLine === false) return
      const delay = Math.max(0, allowedAt.current - Date.now(), lastRequestAt.current + 60_000 - Date.now())
      timer = setTimeout(load, delay)
    }
    schedule()
    document.addEventListener('visibilitychange', schedule)
    window.addEventListener('online', schedule)
    window.addEventListener('offline', schedule)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', schedule)
      window.removeEventListener('online', schedule)
      window.removeEventListener('offline', schedule)
    }
  }, [autoRefresh, loading, nextRequestAt, load])

  return { result, error, loading, load, now, notice, waitSeconds: Math.max(0, Math.ceil((nextRequestAt - now) / 1000)) }
}
