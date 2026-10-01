import CollectionTable from './CollectionTable.jsx'

function getWorkoutsEndpoint(codespaceName = import.meta.env.VITE_CODESPACE_NAME) {
  const name = codespaceName?.trim()
  return name
    ? `https://${name}-8000.app.github.dev/api/workouts`
    : '/api/workouts'
}

function Workouts({ records, loading, error }) {
  return (
    <CollectionTable
      title="Workouts"
      records={records}
      loading={loading}
      error={error}
      columns={[
        { key: 'title', label: 'Workout' },
        { key: 'difficulty', label: 'Level' },
        { key: 'durationMinutes', label: 'Duration', format: (workout) => `${workout.durationMinutes} min` },
        { key: 'exercises', label: 'Exercises', format: (workout) => workout.exercises?.length ?? 0 },
      ]}
    />
  )
}

Workouts.getEndpoint = getWorkoutsEndpoint

export default Workouts