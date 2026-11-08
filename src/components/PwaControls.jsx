export default function PwaControls({ pwa }) {
  if (!pwa.needRefresh) return null
  return <aside aria-label="App update" className="mt-8 rounded-2xl bg-panel p-5 text-sm leading-6">
    <div role="status" className="flex flex-wrap items-center gap-3">
      <p>A new version of UdaraKita is ready.</p>
      <button type="button" onClick={pwa.update} className="action-button">Update app</button>
      <button type="button" onClick={pwa.dismissUpdate} className="secondary-button">Later</button>
    </div>
    {pwa.installMessage && <p role="status" className="mt-3">{pwa.installMessage}</p>}
  </aside>
}
