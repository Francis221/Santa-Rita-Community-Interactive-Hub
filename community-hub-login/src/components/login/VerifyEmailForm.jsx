import React from 'react';
import CommunityHubLogo from './CommunityHubLogo.jsx';
import emailjs from '@emailjs/browser';

class VerifyEmailForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      digits: ['', '', '', '', '', ''],
      submitting: false,
      resending: false,
      errorMessage: '',
      successMessage: '',
      timeLeft: 600,
      resendCooldown: 60,
    };
    this.inputRefs = Array.from({ length: 6 }, () => React.createRef());
    this.handleDigitChange = this.handleDigitChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleResendCode = this.handleResendCode.bind(this);
  }

  componentDidMount() {
    this.expiryTimer = setInterval(() => {
      this.setState((prevState) => ({
        timeLeft: prevState.timeLeft > 0 ? prevState.timeLeft - 1 : 0,
      }));
    }, 1000);

    this.cooldownTimer = setInterval(() => {
      this.setState((prevState) => ({
        resendCooldown: prevState.resendCooldown > 0 ? prevState.resendCooldown - 1 : 0,
      }));
    }, 1000);
  }

  componentWillUnmount() {
    if (this.expiryTimer) clearInterval(this.expiryTimer);
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
  }

  handleDigitChange(index, event) {
    const value = event.target.value.replace(/[^0-9]/g, '').slice(-1);
    const digits = [...this.state.digits];
    digits[index] = value;
    this.setState({ digits, errorMessage: '' });

    if (value && index < 5) {
      this.inputRefs[index + 1].current.focus();
    }
  }

  handleKeyDown(index, event) {
    if (event.key === 'Backspace' && !this.state.digits[index] && index > 0) {
      this.inputRefs[index - 1].current.focus();
    }
  }

  handlePaste(event) {
    event.preventDefault();
    const pastedData = event.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pastedData) {
      const digits = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
      this.setState({ digits, errorMessage: '' });
      const nextFocus = Math.min(pastedData.length, 5);
      if (this.inputRefs[nextFocus] && this.inputRefs[nextFocus].current) {
        this.inputRefs[nextFocus].current.focus();
      }
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const code = this.state.digits.join('');
    const email = this.props.email;

    if (code.length !== 6) {
      this.setState({ errorMessage: 'Please enter all 6 digits of your verification code.' });
      return;
    }

    if (!email) {
      this.setState({ errorMessage: 'Session missing email address. Please request a new code.' });
      return;
    }

    this.setState({ submitting: true, errorMessage: '', successMessage: '' });

    try {
      const response = await fetch('/api/verify-reset-code.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, code }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('JSON parse error:', jsonErr);
      }

      if (response.ok && data.success) {
        this.setState({
          successMessage: 'Code verified successfully!',
          submitting: false,
        });

        setTimeout(() => {
          if (this.props.onVerified) {
            this.props.onVerified(email, code);
          } else if (this.props.onNavigate) {
            this.props.onNavigate('reset');
          }
        }, 800);
      } else {
        this.setState({
          errorMessage: data.message || data.error || 'Invalid or expired verification code',
          submitting: false,
        });
      }
    } catch (err) {
      console.error('Verify code API error:', err);
      this.setState({
        errorMessage: 'Connection error. Please ensure PHP server is running on http://127.0.0.1:8000.',
        submitting: false,
      });
    }
  }

  async handleResendCode() {
    const email = this.props.email;
    if (!email || this.state.resendCooldown > 0) return;

    this.setState({ resending: true, errorMessage: '', successMessage: '' });

    try {
      const response = await fetch('/api/forgot-password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

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
            console.warn('EmailJS Resend SDK warning:', sdkError);
          });
      }

      this.setState({
        resending: false,
        resendCooldown: 60,
        timeLeft: 600,
        successMessage: 'A new 6-digit code has been sent to your email.',
      });
    } catch (err) {
      console.error('Resend code error:', err);
      this.setState({
        resending: false,
        errorMessage: 'Failed to resend code. Please try again.',
      });
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  render() {
    const { digits, submitting, resending, errorMessage, successMessage, timeLeft, resendCooldown } = this.state;
    const { email, onNavigate } = this.props;

    return (
      <div className="chub-card">
        <h2 className="chub-card__title">Community Hub</h2>
        <p className="chub-card__subtitle">Enter Verification Code</p>
        <p className="chub-card__hint">
          We sent a 6-digit code to: <br />
          <strong style={{ color: '#a5b4fc' }}>{email || 'your email'}</strong>
        </p>

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
            ✅ {successMessage}
          </div>
        )}

        <form onSubmit={this.handleSubmit}>
          <div className="chub-otp-row" onPaste={this.handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={this.inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength="1"
                className="chub-otp-box"
                value={digit}
                onChange={(event) => this.handleDigitChange(index, event)}
                onKeyDown={(event) => this.handleKeyDown(index, event)}
                disabled={submitting}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1.25rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            Code expires in:{' '}
            <span style={{ color: timeLeft > 60 ? '#38bdf8' : '#ef4444', fontWeight: 'bold' }}>
              {this.formatTime(timeLeft)}
            </span>
          </div>

          <button type="submit" className="chub-btn chub-btn--primary" disabled={submitting || digits.join('').length < 6}>
            {submitting ? 'Verifying Code...' : 'Verify Code'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button
            type="button"
            className="chub-link"
            onClick={this.handleResendCode}
            disabled={resendCooldown > 0 || resending || submitting}
            style={{ opacity: resendCooldown > 0 ? 0.6 : 1, cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer' }}
          >
            {resending
              ? 'Sending code...'
              : resendCooldown > 0
              ? `Resend Code in ${resendCooldown}s`
              : 'Resend Code'}
          </button>
        </div>

        <button type="button" className="chub-back-link" onClick={() => onNavigate('login')} disabled={submitting}>
          ← Back to Login
        </button>
      </div>
    );
  }
}

export default VerifyEmailForm;
