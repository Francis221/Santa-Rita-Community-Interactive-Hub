import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../App.jsx'

export default function Login() {
  const { setUser } = useAuth()
  const flash = useLocation().state?.flash
  const [form, setForm] = useState({ login: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const d = await api('login.php', { method: 'POST', body: form })
      setUser(d.user)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <main className="card">
      <h1>Log in</h1>
      {flash && <p className="alert ok">{flash}</p>}
      {error && <p className="alert error">{error}</p>}
      <form onSubmit={submit}>
        <label>Username or email
          <input name="login" value={form.login} onChange={onChange} required autoFocus />
        </label>
        <label>Password
          <input type="password" name="password" value={form.password} onChange={onChange} required />
        </label>
        <button disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <p className="muted">No account yet? <Link to="/register">Create one</Link></p>
    </main>
  )
}
