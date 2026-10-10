import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App.jsx'

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('dashboard.php').then(setData).catch((e) => setError(e.message))
  }, [])

  return (
    <main className="wrap">
      <h1>Welcome back, {user.username}</h1>
      {error && <p className="alert error">{error}</p>}
      {data && (
        <>
          <section className="stats">
            <div><b>{data.total}</b><span>Registered users</span></div>
            <div><b>{data.total - data.legacy}</b><span>Accounts with secure passwords</span></div>
            <div><b>{data.legacy}</b><span>Accounts awaiting upgrade</span></div>
          </section>

          <section className="panel">
            <h2>Your account</h2>
            <dl>
              <dt>User ID</dt><dd>{user.id}</dd>
              <dt>Username</dt><dd>{user.username}</dd>
              <dt>Email</dt><dd>{user.email}</dd>
            </dl>
          </section>

          <section className="panel">
            <h2>Newest members</h2>
            <table>
              <thead><tr><th>Username</th><th>Email</th></tr></thead>
              <tbody>
                {data.latest.map((u) => <tr key={u.email}><td>{u.username}</td><td>{u.email}</td></tr>)}
              </tbody>
            </table>
            <p><Link to="/report">See the full report</Link></p>
          </section>
        </>
      )}
    </main>
  )
}
