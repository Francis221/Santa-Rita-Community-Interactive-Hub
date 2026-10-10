import React, { useState } from 'react';
import CommunityHubLogo from './CommunityHubLogo.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginForm({ onNavigate, onLoginSuccess, successMessage }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success) {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else if (onNavigate) {
        onNavigate('/');
      }
    } else {
      setErrorMessage(result.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="chub-card">
      <h2 className="chub-card__title">Community Hub</h2>
      <p className="chub-card__subtitle">Sign in to your barangay account</p>

      {successMessage && !errorMessage && (
        <div
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#34d399',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          ✅ {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#f87171',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      <form className="chub-form" onSubmit={handleSubmit}>
        <label className="chub-field">
          <span className="chub-field__label">Email address or Username</span>
          <input
            type="text"
            name="email"
            placeholder="you@example.com or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
          />
        </label>

        <label className="chub-field">
          <span className="chub-field__label">Password</span>
          <div className="chub-field__input-row">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
            <button
              type="button"
              className="chub-field__ghost-btn"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <div className="chub-row-between">
          <label className="chub-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe((prev) => !prev)}
            />
            <span>Remember me</span>
          </label>
          <button type="button" className="chub-link" onClick={() => onNavigate && onNavigate('forgot')}>
            Forgot Password?
          </button>
        </div>

        <button type="submit" className="chub-btn chub-btn--primary" disabled={submitting}>
          {submitting ? 'Authenticating...' : 'Login'}
        </button>
      </form>

      <div className="chub-divider"><span>or</span></div>

      <button
        type="button"
        className="chub-btn chub-btn--outline"
        onClick={() => onNavigate && onNavigate('signup')}
        disabled={submitting}
      >
        Create an account
      </button>

      <p className="chub-fineprint">By continuing you agree to the Terms &amp; Conditions</p>
    </div>
  );
}
