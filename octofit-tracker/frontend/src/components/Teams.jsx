import CollectionTable from './CollectionTable.jsx'

function getTeamsEndpoint(codespaceName = import.meta.env.VITE_CODESPACE_NAME) {
  const name = codespaceName?.trim()
  return name
    ? `https://${name}-8000.app.github.dev/api/teams`
    : '/api/teams'
}

function Teams({ records, loading, error }) {
  return (
    <CollectionTable
      title="Teams"
      records={records}
      loading={loading}
      error={error}
      columns={[
        { key: 'name', label: 'Team' },
        { key: 'members', label: 'Members', format: (team) => team.members?.length ?? 0 },
        { key: 'points', label: 'Points' },
      ]}
    />
  )
}

Teams.getEndpoint = getTeamsEndpoint

export default Teams