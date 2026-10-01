import CollectionTable from './CollectionTable.jsx'

function getUsersEndpoint(codespaceName = import.meta.env.VITE_CODESPACE_NAME) {
  const name = codespaceName?.trim()
  return name
    ? `https://${name}-8000.app.github.dev/api/users`
    : '/api/users'
}

function Users({ records, loading, error }) {
  return (
    <CollectionTable
      title="Members"
      records={records}
      loading={loading}
      error={error}
      columns={[
        { key: 'displayName', label: 'Name' },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
      ]}
    />
  )
}

Users.getEndpoint = getUsersEndpoint

export default Users