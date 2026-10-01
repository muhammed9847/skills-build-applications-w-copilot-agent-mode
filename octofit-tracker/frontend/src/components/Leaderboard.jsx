import CollectionTable from './CollectionTable.jsx'

function getLeaderboardEndpoint(codespaceName = import.meta.env.VITE_CODESPACE_NAME) {
  const name = codespaceName?.trim()
  return name
    ? `https://${name}-8000.app.github.dev/api/leaderboard`
    : '/api/leaderboard'
}

function shortId(value) {
  if (!value) return '—'
  const id = typeof value === 'string' ? value : value.toString()
  return id.length > 12 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id
}

function Leaderboard({ records, loading, error }) {
  return (
    <CollectionTable
      title="Leaderboard"
      records={records}
      loading={loading}
      error={error}
      columns={[
        { key: 'rank', label: 'Rank', format: (entry) => `#${entry.rank}` },
        { key: 'user', label: 'Member', format: (entry) => shortId(entry.user) },
        { key: 'team', label: 'Team', format: (entry) => shortId(entry.team) },
        { key: 'points', label: 'Points' },
      ]}
    />
  )
}

Leaderboard.getEndpoint = getLeaderboardEndpoint

export default Leaderboard