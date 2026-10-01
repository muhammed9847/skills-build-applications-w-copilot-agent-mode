function CollectionTable({ title, records, columns, loading, error }) {
  return (
    <section className="data-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DIRECT FROM YOUR API</p>
          <h2>{title}</h2>
        </div>
        <span className="record-count">
          {records.length} {records.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      <div className="table-wrap">
        {!loading && !error && records.length === 0 && (
          <div className="empty-state">No {title.toLowerCase()} have been added yet.</div>
        )}
        {loading && <div className="empty-state">Loading {title.toLowerCase()}…</div>}
        {!loading && records.length > 0 && (
          <table>
            <thead>
              <tr>
                {columns.map((column) => <th key={column.key}>{column.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record._id ?? `${title}-${index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.format ? column.format(record) : record[column.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

export default CollectionTable