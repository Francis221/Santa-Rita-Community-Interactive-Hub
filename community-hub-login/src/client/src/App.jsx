import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom'
import { api } from './api'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Report from './pages/Report.jsx'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

function Protected() {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user) return <Navigate to="/login" replace />
  const logout = async () => {
    await api('logout.php', { method: 'POST', body: {} })
    navigate('/login')
    window.location.reload()
  }
  return (
    <>
      <nav className="nav">
        <strong>Login System</strong>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/report">Report</NavLink>
        <span className="spacer" />
        <span className="who">{user.username}</span>
        <button className="link" onClick={logout}>Log out</button>
      </nav>
      <Outlet />
    </>
  )
}

function GuestOnly() {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : <div className="auth"><Outlet /></div>
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('me.php').then((d) => setUser(d.user)).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="muted center">Loading…</p>

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<Protected />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/report" element={<Report />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthContext.Provider>
  )
}
