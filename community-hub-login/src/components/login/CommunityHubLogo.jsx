import React from 'react';
import logoImg from '../../assets/logo.png';

class CommunityHubLogo extends React.Component {
  render() {
    const isHero = this.props.variant === 'hero';
    const size = isHero ? 240 : 88;

    return (
      <div
        className={`chub-logo ${isHero ? 'chub-logo--hero' : 'chub-logo--card'}`}
        style={{ width: size, height: size }}
      >
        <img
          src={logoImg}
          alt="Community Hub Logo"
          className="chub-logo__img"
        />
      </div>
    );
  }
}

export default CommunityHubLogo;
