import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import App from './App.jsx';
import Login from './Login.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import './styles/homemain.css';
import './styles/home.css';
import './loginmain.css';
import './login.css';

function MainRouter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0b1329 0%, #1a2b4c 100%)',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '2.5rem',
            marginBottom: '1rem',
            animation: 'pulse 1.5s infinite ease-in-out',
          }}>
            🏛️
          </div>
          <p style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.9 }}>
            Connecting to Barangay Community Hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={() => navigate('/')} />}
      />
      <Route
        path="/*"
        element={user ? <App /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
