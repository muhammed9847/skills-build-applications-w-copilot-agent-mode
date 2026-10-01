import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { expect, test, vi } from 'vitest'
import { getApiUrl, normalizeCollection } from '../src/api.js'
import Activities from '../src/components/Activities.jsx'
import Leaderboard from '../src/components/Leaderboard.jsx'
import Teams from '../src/components/Teams.jsx'
import Users from '../src/components/Users.jsx'
import Workouts from '../src/components/Workouts.jsx'
import App from '../src/App.jsx'

const collections = {
  users: [{ _id: 'user-1', displayName: 'Avery Chen', username: 'avery-chen', email: 'avery@example.com' }],
  teams: [{ _id: 'team-1', name: 'Morning Miles', members: ['user-1', 'user-2'], points: 1480 }],
  activities: [{ _id: 'activity-1', activityType: 'running', durationMinutes: 38, distanceKm: 6.2, performedAt: '2026-09-25T06:45:00.000Z' }],
  leaderboard: [{ _id: 'entry-1', user: 'user-1', team: 'team-1', points: 860, rank: 1 }],
  workouts: [{ _id: 'workout-1', title: 'Endurance Run', difficulty: 'beginner', durationMinutes: 30, exercises: ['Run', 'Walk'] }],
}

const health = { status: 'ok', database: 'connected', apiBaseUrl: 'http://localhost:8000' }

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Service Unavailable',
    json: async () => body,
  }
}

function successfulFetch(url) {
  if (url === '/api/health') return Promise.resolve(jsonResponse(health))
  const collection = url.slice('/api/'.length)
  return Promise.resolve(jsonResponse(collections[collection]))
}

function renderApp() {
  return render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )
}

test('builds Codespaces URLs and keeps relative URLs for local development', () => {
  expect(getApiUrl('health', 'octofit')).toBe('https://octofit-8000.app.github.dev/api/health')
  expect(getApiUrl('health', '')).toBe('/api/health')
  expect(Users.getEndpoint('octofit')).toBe('https://octofit-8000.app.github.dev/api/users')
  expect(Teams.getEndpoint('octofit')).toContain('-8000.app.github.dev/api/teams')
  expect(Activities.getEndpoint('octofit')).toContain('-8000.app.github.dev/api/activities')
  expect(Leaderboard.getEndpoint('octofit')).toContain('-8000.app.github.dev/api/leaderboard')
  expect(Workouts.getEndpoint('octofit')).toContain('-8000.app.github.dev/api/workouts')
  expect(Users.getEndpoint('')).toBe('/api/users')
})

test('normalizes array and paginated collection responses', () => {
  expect(normalizeCollection(collections.users)).toEqual(collections.users)
  expect(normalizeCollection({ count: 1, results: collections.users })).toEqual(collections.users)
  expect(normalizeCollection({ data: collections.users })).toEqual(collections.users)
})

test('loads live dashboard data and API/database status', async () => {
  vi.stubGlobal('fetch', vi.fn(successfulFetch))

  renderApp()

  expect(screen.getByText('Loading members…')).toBeInTheDocument()
  expect(await screen.findByText('Avery Chen')).toBeInTheDocument()
  expect(screen.getByText('API connected')).toBeInTheDocument()
  expect(screen.getByText('Database connected')).toBeInTheDocument()
  expect(screen.queryByText('Morning Miles')).not.toBeInTheDocument()
})

test('switches between collection tabs', async () => {
  vi.stubGlobal('fetch', vi.fn(successfulFetch))

  renderApp()

  await screen.findByText('Avery Chen')
  fireEvent.click(screen.getByRole('link', { name: /Teams/ }))

  expect(await screen.findByText('Morning Miles')).toBeInTheDocument()
  expect(screen.getByText('1480')).toBeInTheDocument()
})

test('shows API errors and retries successfully', async () => {
  let healthRequests = 0
  const fetchMock = vi.fn((url) => {
    if (url === '/api/health' && healthRequests++ === 0) {
      return Promise.resolve(jsonResponse({}, 503))
    }
    return successfulFetch(url)
  })
  vi.stubGlobal('fetch', fetchMock)

  renderApp()

  expect(await screen.findByRole('alert')).toHaveTextContent('503 Service Unavailable')
  fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

  expect(await screen.findByText('Avery Chen')).toBeInTheDocument()
  expect(screen.getByText('API connected')).toBeInTheDocument()
  expect(fetchMock).toHaveBeenCalledTimes(12)
})