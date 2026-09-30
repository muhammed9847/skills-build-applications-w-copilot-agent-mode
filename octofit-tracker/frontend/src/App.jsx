import { useEffect, useState } from 'react'
import brandMark from '../../../docs/octofitapp-small.png'
import './App.css'

const views = [
  {
    id: 'users',
    label: 'Members',
    columns: [
      { key: 'displayName', label: 'Name' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
    ],
  },
  {
    id: 'teams',
    label: 'Teams',
    columns: [
      { key: 'name', label: 'Team' },
      { key: 'members', label: 'Members', format: (team) => team.members?.length ?? 0 },
      { key: 'points', label: 'Points' },
    ],
  },
  {
    id: 'activities',
    label: 'Activities',
    columns: [
      { key: 'activityType', label: 'Activity' },
      { key: 'durationMinutes', label: 'Duration', format: (activity) => `${activity.durationMinutes} min` },
      { key: 'distanceKm', label: 'Distance', format: (activity) => activity.distanceKm ? `${activity.distanceKm} km` : '—' },
      { key: 'performedAt', label: 'Date', format: (activity) => formatDate(activity.performedAt) },
    ],
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    columns: [
      { key: 'rank', label: 'Rank', format: (entry) => `#${entry.rank}` },
      { key: 'user', label: 'Member', format: (entry) => shortId(entry.user) },
      { key: 'team', label: 'Team', format: (entry) => shortId(entry.team) },
      { key: 'points', label: 'Points' },
    ],
  },
  {
    id: 'workouts',
    label: 'Workouts',
    columns: [
      { key: 'title', label: 'Workout' },
      { key: 'difficulty', label: 'Level' },
      { key: 'durationMinutes', label: 'Duration', format: (workout) => `${workout.durationMinutes} min` },
      { key: 'exercises', label: 'Exercises', format: (workout) => workout.exercises?.length ?? 0 },
    ],
  },
]

async function getJson(path) {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function loadDashboard() {
  const [health, ...collections] = await Promise.all([
    getJson('/api/health'),
    ...views.map((view) => getJson(`/api/${view.id}`)),
  ])

  return {
    health,
    collections: Object.fromEntries(views.map((view, index) => [view.id, collections[index]])),
  }
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function shortId(value) {
  if (!value) return '—'
  const id = typeof value === 'string' ? value : value.toString()
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id
}

function App() {
  const [dashboard, setDashboard] = useState(null)
  const [activeView, setActiveView] = useState('users')
  const [refreshToken, setRefreshToken] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  function refreshData() {
    setLoading(true)
    setError('')
    setRefreshToken((token) => token + 1)
  }

  useEffect(() => {
    let current = true

    loadDashboard()
      .then((data) => {
        if (current) setDashboard(data)
      })
      .catch((requestError) => {
        if (current) setError(requestError.message || 'Could not reach the OctoFit API.')
      })
      .finally(() => {
        if (current) setLoading(false)
      })

    return () => {
      current = false
    }
  }, [refreshToken])

  const currentView = views.find((view) => view.id === activeView)
  const records = dashboard?.collections[activeView] ?? []
  const collections = dashboard?.collections ?? {}
  const apiConnected = dashboard?.health?.status === 'ok'
  const databaseConnected = dashboard?.health?.database === 'connected'

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="OctoFit Tracker home">
          <img src={brandMark} alt="" />
          <span>OctoFit <b>Tracker</b></span>
        </a>
        <div className="topbar-meta">
          <span className="school-label">MERGINGTON HIGH SCHOOL</span>
          <button
            className="refresh-button"
            type="button"
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh data'}
          </button>
        </div>
      </header>

      <section className="page-heading">
        <div>
          <p className="eyebrow">FITNESS OVERVIEW</p>
          <h1>Team activity</h1>
          <p className="heading-copy">A live view of your community’s training and progress.</p>
        </div>
        <div className="connection-status" aria-live="polite">
          <span className={`status-dot ${apiConnected ? 'is-online' : ''}`} />
          <span>API {apiConnected ? 'connected' : loading ? 'checking' : 'unavailable'}</span>
          <span className="status-divider" />
          <span className={`status-dot ${databaseConnected ? 'is-online' : ''}`} />
          <span>Database {databaseConnected ? 'connected' : dashboard ? 'connecting' : '—'}</span>
        </div>
      </section>

      {error && (
        <div className="error-banner" role="alert">
          <span>{`Could not load API data: ${error}`}</span>
          <button type="button" onClick={refreshData}>Try again</button>
        </div>
      )}

      <section className="summary-grid" aria-label="Community totals">
        {[
          { id: 'users', label: 'Members', accent: 'green' },
          { id: 'teams', label: 'Teams', accent: 'blue' },
          { id: 'activities', label: 'Activities', accent: 'orange' },
          { id: 'workouts', label: 'Workouts', accent: 'rose' },
        ].map((item) => (
          <article className={`summary-tile ${item.accent}`} key={item.id}>
            <span>{item.label}</span>
            <strong>{collections[item.id]?.length ?? '—'}</strong>
            <small>total records</small>
          </article>
        ))}
      </section>

      <section className="data-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">DIRECT FROM YOUR API</p>
            <h2>Tracker data</h2>
          </div>
          <span className="record-count">{records.length} {records.length === 1 ? 'record' : 'records'}</span>
        </div>

        <nav className="data-tabs" aria-label="Tracker data collections">
          {views.map((view) => (
            <button
              aria-pressed={activeView === view.id}
              className={activeView === view.id ? 'active' : ''}
              key={view.id}
              onClick={() => setActiveView(view.id)}
              type="button"
            >
              {view.label}
              <span>{collections[view.id]?.length ?? '–'}</span>
            </button>
          ))}
        </nav>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {currentView.columns.map((column) => <th key={column.key}>{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  {currentView.columns.map((column) => (
                    <td key={column.key}>
                      {column.format ? column.format(record) : record[column.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !error && records.length === 0 && (
            <div className="empty-state">No {currentView.label.toLowerCase()} have been added yet.</div>
          )}
          {loading && !dashboard && <div className="empty-state">Connecting to the OctoFit API…</div>}
        </div>
      </section>

      <footer className="page-footer">
        <span>OCTOFIT TRACKER</span>
        <span>Live application data</span>
      </footer>
    </main>
  )
}

export default App
