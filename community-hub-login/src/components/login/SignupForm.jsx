import React, { useState } from 'react';
import CommunityHubLogo from './CommunityHubLogo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// Shrinks the image so the base64 payload stays small (~50-150KB instead of MBs).
const resizeImage = (file, max = 256) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image.'));
    };
    img.src = url;
  });

export default function SignupForm({ onNavigate }) {
  const { register } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePhotoChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please choose an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Profile photo size must be less than 5MB.');
      return;
    }

    try {
      setErrorMessage('');
      const dataUrl = await resizeImage(file);
      setPhotoName(file.name);
      setPhotoBase64(dataUrl);
      setPhotoPreview(dataUrl);
    } catch (err) {
      setErrorMessage(err.message || 'Could not process the photo.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    // Ensure username is clean alphanumeric/underscore
    const cleanUsername = username.trim().replace(/\s+/g, '_');

    if (!/^[A-Za-z0-9_]{3,50}$/.test(cleanUsername)) {
      setErrorMessage('Username must be 3–50 characters: letters, numbers or underscore.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please agree to the Terms and Conditions.');
      return;
    }

    setSubmitting(true);
    const result = await register(cleanUsername, email.trim(), password, photoBase64);
    setSubmitting(false);

    if (result.success) {
      if (onNavigate) {
        onNavigate('login', '', 'Account created successfully! Please sign in with your credentials.');
      }
    } else {
      setErrorMessage(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="chub-card">
      <CommunityHubLogo variant="card" />
      <h2 className="chub-card__title">Community Hub</h2>
      <p className="chub-card__subtitle">Create your account</p>

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

      <label className="chub-avatar-upload" style={{ overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <input type="file" accept="image/*" onChange={handlePhotoChange} hidden disabled={submitting} />
        {photoPreview ? (
          <img src={photoPreview} alt="Avatar Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
        ) : (
          <span aria-hidden="true">📷</span>
        )}
      </label>
      <p className="chub-avatar-label">{photoName || 'Upload Profile Photo'}</p>

      <form className="chub-form" onSubmit={handleSubmit}>
        <label className="chub-field">
          <span className="chub-field__label">Username</span>
          <input
            type="text"
            name="username"
            placeholder="juandelacruz"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={3}
            maxLength={50}
            disabled={submitting}
          />
        </label>

        <label className="chub-field">
          <span className="chub-field__label">Email address</span>
          <input
            type="email"
            name="email"
            placeholder="juan@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={100}
            disabled={submitting}
          />
        </label>

        <label className="chub-field">
          <span className="chub-field__label">Password</span>
          <input
            type="password"
            name="password"
            placeholder="•••••••• (Min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            disabled={submitting}
          />
        </label>

        <label className="chub-field">
          <span className="chub-field__label">Confirm Password</span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            disabled={submitting}
          />
        </label>

        <label className="chub-terms">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={() => setAgreedToTerms((prev) => !prev)}
            disabled={submitting}
          />
          <span>
            I agree to the{' '}
            <a href="#terms" onClick={(e) => e.preventDefault()}>Terms and Conditions</a>
          </span>
        </label>

        <button type="submit" className="chub-btn chub-btn--primary" disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="chub-footer-text">
        Already have an account?{' '}
        <button type="button" className="chub-link" onClick={() => onNavigate && onNavigate('login')}>
          Sign In
        </button>
      </p>
    </div>
  );
}