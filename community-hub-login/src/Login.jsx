import React from 'react';
import CommunityHubLogo from './componentslogin/CommunityHubLogo.jsx';
import LoginForm from './componentslogin/LoginForm.jsx';
import SignupForm from './componentslogin/SignupForm.jsx';
import VerifyEmailForm from './componentslogin/VerifyEmailForm.jsx';
import ForgotPasswordForm from './componentslogin/ForgotPasswordForm.jsx';
import ResetPasswordForm from './componentslogin/ResetPasswordForm.jsx';
import './login.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      view: 'login',
      resetEmail: '',
      resetCode: '',
      successMessage: '',
    };
    this.setView = this.setView.bind(this);
    this.handleEmailSubmitted = this.handleEmailSubmitted.bind(this);
    this.handleCodeVerified = this.handleCodeVerified.bind(this);
  }

  setView(nextView, email = '', successMsg = '') {
    this.setState((prev) => ({
      view: nextView,
      resetEmail: email || prev.resetEmail,
      successMessage: successMsg,
    }));
  }

  handleEmailSubmitted(email) {
    this.setState({
      resetEmail: email,
      view: 'verify',
      successMessage: '',
    });
  }

  handleCodeVerified(email, code) {
    this.setState({
      resetEmail: email,
      resetCode: code,
      view: 'reset',
      successMessage: '',
    });
  }

  renderActivePanel() {
    switch (this.state.view) {
      case 'signup':
        return <SignupForm onNavigate={this.setView} />;
      case 'verify':
        return (
          <VerifyEmailForm
            email={this.state.resetEmail}
            onNavigate={this.setView}
            onVerified={this.handleCodeVerified}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordForm
            onNavigate={this.setView}
            onEmailSubmitted={this.handleEmailSubmitted}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm
            email={this.state.resetEmail}
            code={this.state.resetCode}
            onNavigate={this.setView}
          />
        );
      case 'login':
      default:
        return (
          <LoginForm
            onNavigate={this.setView}
            onLoginSuccess={this.props.onLoginSuccess}
            successMessage={this.state.successMessage}
          />
        );
    }
  }

  render() {
    return (
      <div className="chub-page">
        <section className="chub-hero">
          <CommunityHubLogo variant="hero" />
          <h1 className="chub-hero__title">Community</h1>
          <p className="chub-hero__subtitle">Interactive Hub</p>
          <div className="chub-hero__rule" />
          <p className="chub-hero__tagline">Connect · Engage · Grow</p>
          <p className="chub-hero__desc">
            Your barangay, one tap away — stay informed, file reports and chat with your officials.
          </p>
          <div className="chub-hero__pills">
            <span className="chub-pill">Announcements</span>
            <span className="chub-pill">Reports</span>
            <span className="chub-pill">Messages</span>
          </div>
        </section>

        <section className="chub-panel">
          {this.renderActivePanel()}
        </section>
      </div>
    );
  }
}

export default App;
