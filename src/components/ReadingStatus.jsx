import { freshnessMessage } from '../utils/stations.js'

export default function ReadingStatus({ airQuality }) {
  const { result, error, loading, now } = airQuality
  const freshness = freshnessMessage(result, now)
  return <>
    {!result && loading && <p role="status" className="notice">Loading station readings…</p>}
    {error && <p role="alert" className="notice">{error}{result && ' Showing the previously loaded snapshot; observations have not been updated.'}</p>}
    {result?.offline && <p role="status" className="notice">Connection unavailable. Showing saved readings from {new Intl.DateTimeFormat('en-MY', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(result.savedAt)} MYT. These are not live readings. Go online and refresh to update them.</p>}
    {freshness && <p role="status" className="notice">{freshness}</p>}
  </>
}
