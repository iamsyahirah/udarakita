export default function StateFilter({ states, value, onChange }) {
  return (
    <div className="min-w-0 sm:w-52">
      <label htmlFor="state-filter" className="mb-2 block text-xs text-muted">Filter by state</label>
      <select id="state-filter" className="control w-full px-4 py-3.5" value={value} onChange={event => onChange(event.target.value)}>
        <option value="">All states</option>
        {states.map(state => <option key={state} value={state}>{state}</option>)}
      </select>
    </div>
  )
}
