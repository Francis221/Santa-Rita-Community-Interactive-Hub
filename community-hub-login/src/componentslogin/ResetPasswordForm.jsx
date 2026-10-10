import React from 'react';
import CommunityHubLogo from './CommunityHubLogo.jsx';

class ResetPasswordForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newPassword: '',
      confirmPassword: '',
      showPassword: false,
      submitting: false,
      errorMessage: '',
      successMessage: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleShowPassword = this.toggleShowPassword.bind(this);
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value, errorMessage: '' });
  }

  toggleShowPassword() {
    this.setState((prev) => ({ showPassword: !prev.showPassword }));
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { newPassword, confirmPassword } = this.state;
    const { email, code, onNavigate } = this.props;

    // Client-side validations
    if (!newPassword) {
      this.setState({ errorMessage: 'Please enter a new password.' });
      return;
    }

    if (newPassword.length < 6) {
      this.setState({ errorMessage: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      this.setState({ errorMessage: 'New password and confirmation password do not match.' });
      return;
    }

    if (!email || !code) {
      this.setState({ errorMessage: 'Missing verification context. Please restart the password reset process.' });
      return;
    }

    this.setState({ submitting: true, errorMessage: '', successMessage: '' });

    try {
      const response = await fetch('/api/reset-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          code,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setState({
          successMessage: data.message || 'Password reset successfully!',
          submitting: false,
        });

        // Redirect to Login page after 1.5 seconds
        setTimeout(() => {
          if (onNavigate) {
            onNavigate('login', '', 'Password reset successfully! You can now log in with your new password.');
          }
        }, 1500);
      } else {
        this.setState({
          errorMessage: data.message || 'Failed to reset password. Please try again.',
          submitting: false,
        });
      }
    } catch (err) {
      console.error('Reset password API error:', err);
      this.setState({
        errorMessage: 'Network error. Please try again later.',
        submitting: false,
      });
    }
  }

  render() {
    const { newPassword, confirmPassword, showPassword, submitting, errorMessage, successMessage } = this.state;
    const { onNavigate } = this.props;

    return (
      <div className="chub-card">
        <h2 className="chub-card__title">Community Hub</h2>
        <p className="chub-card__subtitle">Create New Password</p>
        <p className="chub-card__hint">Enter your new password below to reset your account credentials</p>

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

        {successMessage && (
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
            🎉 {successMessage} <br />
            <small style={{ color: '#cbd5e1' }}>Redirecting to Login...</small>
          </div>
        )}

        <form className="chub-form" onSubmit={this.handleSubmit}>
          <label className="chub-field">
            <span className="chub-field__label">New Password</span>
            <div className="chub-field__input-row">
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                placeholder="••••••••"
                value={newPassword}
                onChange={this.handleChange}
                required
                disabled={submitting}
              />
              <button
                type="button"
                className="chub-field__ghost-btn"
                onClick={this.toggleShowPassword}
                disabled={submitting}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>

          <label className="chub-field">
            <span className="chub-field__label">Confirm New Password</span>
            <div className="chub-field__input-row">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={this.handleChange}
                required
                disabled={submitting}
              />
            </div>
          </label>

          <button type="submit" className="chub-btn chub-btn--primary" disabled={submitting}>
            {submitting ? 'Updating Password...' : 'Reset Password'}
          </button>
        </form>

        <button type="button" className="chub-back-link" onClick={() => onNavigate('login')} disabled={submitting}>
          ← Back to Login
        </button>
      </div>
    );
  }
}

export default ResetPasswordForm;
