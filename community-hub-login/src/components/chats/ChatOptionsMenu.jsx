import React from 'react';

class ChatOptionsMenu extends React.Component {
  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  handleOutsideClick = (e) => {
    if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
      this.props.onClose();
    }
  };

  setWrapperRef = (node) => {
    this.wrapperRef = node;
  };

  render() {
    const { onAction } = this.props;

    return (
      <div className="chub-chat-options-menu" ref={this.setWrapperRef}>
        <div className="chub-chat-options-menu__header">More</div>
        <button
          type="button"
          className="chub-chat-options-menu__item chub-chat-options-menu__item--danger"
          onClick={() => onAction('delete')}
        >
          Delete
        </button>
        <button
          type="button"
          className="chub-chat-options-menu__item"
          onClick={() => onAction('pin')}
        >
          Pin
        </button>
        <button
          type="button"
          className="chub-chat-options-menu__item"
          onClick={() => onAction('forward')}
        >
          Forward
        </button>
        <button
          type="button"
          className="chub-chat-options-menu__item"
          onClick={() => onAction('details')}
        >
          Details
        </button>
      </div>
    );
  }
}

export default ChatOptionsMenu;
