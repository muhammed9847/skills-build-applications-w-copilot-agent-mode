import { useEffect, useState } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'
import brandMark from '../../../docs/octofitapp-small.png'
import { getApiUrl, getJson, normalizeCollection } from './api.js'
import Activities from './components/Activities.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Teams from './components/Teams.jsx'
import Users from './components/Users.jsx'
import Workouts from './components/Workouts.jsx'
import './App.css'

const views = [
  { id: 'users', label: 'Members', path: '/users', Component: Users, endpoint: Users.getEndpoint },
  { id: 'teams', label: 'Teams', path: '/teams', Component: Teams, endpoint: Teams.getEndpoint },
  { id: 'activities', label: 'Activities', path: '/activities', Component: Activities, endpoint: Activities.getEndpoint },
  { id: 'leaderboard', label: 'Leaderboard', path: '/leaderboard', Component: Leaderboard, endpoint: Leaderboard.getEndpoint },
  { id: 'workouts', label: 'Workouts', path: '/workouts', Component: Workouts, endpoint: Workouts.getEndpoint },
]

async function loadDashboard() {
  const [health, ...collections] = await Promise.all([
    getJson(getApiUrl('health')),
    ...views.map((view) => getJson(view.endpoint())),
  ])

  return {
    health,
    collections: Object.fromEntries(
      views.map((view, index) => [view.id, normalizeCollection(collections[index])]),
    ),
  }
}

function App() {
  const [dashboard, setDashboard] = useState(null)
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

  const collections = dashboard?.collections ?? {}
  const apiConnected = dashboard?.health?.status === 'ok'
  const databaseConnected = dashboard?.health?.database === 'connected'

  return (
    <main className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/" aria-label="OctoFit Tracker home">
          <img src={brandMark} alt="" />
          <span>OctoFit <b>Tracker</b></span>
        </Link>
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

      <section>
        <nav className="data-tabs" aria-label="Tracker data collections">
          {views.map((view) => (
            <NavLink
              key={view.id}
              to={view.path}
              end
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {view.label}
              <span>{collections[view.id]?.length ?? '–'}</span>
            </NavLink>
          ))}
        </nav>

        <Routes>
          <Route path="/" element={<Navigate to="/users" replace />} />
          {views.map(({ id, path, Component }) => (
            <Route
              key={id}
              path={path}
              element={(
                <Component
                  records={collections[id] ?? []}
                  loading={loading && !dashboard}
                  error={error}
                />
              )}
            />
          ))}
          <Route path="*" element={<Navigate to="/users" replace />} />
        </Routes>
      </section>

      <footer className="page-footer">
        <span>OCTOFIT TRACKER</span>
        <span>Live application data</span>
      </footer>
    </main>
  )
}

export default App
