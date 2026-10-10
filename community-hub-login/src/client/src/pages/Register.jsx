import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState([])
  const [busy, setBusy] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setErrors(['Passwords do not match.'])
    setBusy(true)
    setErrors([])
    try {
      const { confirm, ...body } = form
      await api('register.php', { method: 'POST', body })
      navigate('/login', { state: { flash: 'Account created. You can log in now.' } })
    } catch (err) {
      setErrors(err.errors || [err.message])
      setBusy(false)
    }
  }

  return (
    <main className="card">
      <h1>Create your account</h1>
      {errors.map((m) => <p key={m} className="alert error">{m}</p>)}
      <form onSubmit={submit}>
        <label>Username <input name="username" value={form.username} onChange={onChange} required autoFocus /></label>
        <label>Email <input type="email" name="email" value={form.email} onChange={onChange} required /></label>
        <label>Password <input type="password" name="password" value={form.password} onChange={onChange} required minLength={8} /></label>
        <label>Confirm password <input type="password" name="confirm" value={form.confirm} onChange={onChange} required /></label>
        <button disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="muted">Already registered? <Link to="/login">Log in</Link></p>
    </main>
  )
}
