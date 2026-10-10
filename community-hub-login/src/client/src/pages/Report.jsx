import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Report() {
  const [q, setQ] = useState('')
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState([])
  const [generated, setGenerated] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api('report.php?q=' + encodeURIComponent(search))
      .then((d) => { setRows(d.rows); setGenerated(d.generated) })
      .catch((e) => setError(e.message))
  }, [search])

  const submit = (e) => { e.preventDefault(); setSearch(q.trim()) }

  return (
    <main className="wrap">
      <h1>User report</h1>
      <form onSubmit={submit} className="toolbar">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search username or email" />
        <button>Search</button>
        <a className="btn" href={'/api/report.php?export=1&q=' + encodeURIComponent(search)}>Export CSV</a>
        <button type="button" onClick={() => window.print()}>Print</button>
      </form>

      {error && <p className="alert error">{error}</p>}
      <p className="muted">
        {rows.length} user{rows.length === 1 ? '' : 's'} found
        {generated && ` · generated ${new Date(generated).toLocaleString()}`}
      </p>

      <div className="scroll">
        <table>
          <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Password</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan="4">No users match your search.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td><td>{r.username}</td><td>{r.email}</td>
                <td><span className={'tag ' + (r.pw_status === 'Hashed' ? 'good' : 'warn')}>{r.pw_status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
