import CollectionTable from './CollectionTable.jsx'

function getActivitiesEndpoint(codespaceName = import.meta.env.VITE_CODESPACE_NAME) {
  const name = codespaceName?.trim()
  return name
    ? `https://${name}-8000.app.github.dev/api/activities`
    : '/api/activities'
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function Activities({ records, loading, error }) {
  return (
    <CollectionTable
      title="Activities"
      records={records}
      loading={loading}
      error={error}
      columns={[
        { key: 'activityType', label: 'Activity' },
        { key: 'durationMinutes', label: 'Duration', format: (activity) => `${activity.durationMinutes} min` },
        { key: 'distanceKm', label: 'Distance', format: (activity) => activity.distanceKm != null ? `${activity.distanceKm} km` : '—' },
        { key: 'performedAt', label: 'Date', format: (activity) => formatDate(activity.performedAt) },
      ]}
    />
  )
}

Activities.getEndpoint = getActivitiesEndpoint

export default Activities