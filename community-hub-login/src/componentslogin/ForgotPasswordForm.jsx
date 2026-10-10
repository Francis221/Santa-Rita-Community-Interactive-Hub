import React from 'react';
import CommunityHubLogo from './CommunityHubLogo.jsx';
import emailjs from '@emailjs/browser';

class ForgotPasswordForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      submitting: false,
      message: '',
      errorMessage: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ email: event.target.value });
  }

  async handleSubmit(event) {
    event.preventDefault();
    const { email } = this.state;
    if (!email) return;

    this.setState({ submitting: true, errorMessage: '', message: '' });

    try {
      const response = await fetch('/api/forgot-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Dispatch via EmailJS Browser SDK asynchronously without blocking UI
        if (data.code) {
          const recipientName = email.split('@')[0];
          emailjs
            .send(
              'service_9e6uh5m',
              'template_bhj96te',
              {
                to_email: email,
                email: email,
                user_email: email,
                recipient: email,
                reply_to: email,
                to_name: recipientName.charAt(0).toUpperCase() + recipientName.slice(1),
                passcode: data.code,
                pass_code: data.code,
                code: data.code,
                time: '10 minutes',
              },
              '2XyHVmKrON-bsuB5b'
            )
            .catch((sdkError) => {
              console.warn('EmailJS Browser SDK notice:', sdkError);
            });
        }

        this.setState({
          message: data.message || 'If the email is registered, a verification code has been sent.',
          submitting: false,
        });

        if (this.props.onEmailSubmitted) {
          this.props.onEmailSubmitted(email);
        } else if (this.props.onNavigate) {
          this.props.onNavigate('verify', email);
        }
      } else {
        this.setState({
          errorMessage: data.message || data.error || 'Failed to process request. Please try again.',
          submitting: false,
        });
      }
    } catch (err) {
      console.error('Forgot Password API error:', err);
      this.setState({
        message: 'If the email is registered, a verification code has been sent.',
        submitting: false,
      });
      if (this.props.onEmailSubmitted) {
        this.props.onEmailSubmitted(email);
      } else if (this.props.onNavigate) {
        this.props.onNavigate('verify', email);
      }
    }
  }

  render() {
    const { email, submitting, message, errorMessage } = this.state;
    const { onNavigate } = this.props;

    return (
      <div className="chub-card">
        <h2 className="chub-card__title">Community Hub</h2>
        <p className="chub-card__subtitle">Forgot Password</p>
        <p className="chub-card__hint">Enter your registered email address to receive a 6-digit verification code</p>

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

        {message && (
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
            ✅ {message}
          </div>
        )}

        <form className="chub-form" onSubmit={this.handleSubmit}>
          <label className="chub-field">
            <span className="chub-field__label">Email address</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={this.handleChange}
              required
              disabled={submitting}
            />
          </label>

          <button type="submit" className="chub-btn chub-btn--primary" disabled={submitting}>
            {submitting ? 'Sending Code...' : 'Send Verification Code'}
          </button>
        </form>

        <button type="button" className="chub-back-link" onClick={() => onNavigate('login')} disabled={submitting}>
          ← Back to Login
        </button>
      </div>
    );
  }
}

export default ForgotPasswordForm;
