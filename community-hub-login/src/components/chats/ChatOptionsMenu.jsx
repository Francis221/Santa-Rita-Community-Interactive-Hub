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
      /* Dropdown Popover Menu with Conversation Action Items */
      <div className="chub-chat-options-menu" ref={this.setWrapperRef}>
        <div className="chub-chat-options-menu__header">More</div>
        {/* Button to delete current chat conversation */}
        <button
          type="button"
          className="chub-chat-options-menu__item chub-chat-options-menu__item--danger"
          onClick={() => onAction('delete')}
          title="Delete this conversation"
        >
          Delete
        </button>
        {/* Button to pin conversation to top */}
        <button
          type="button"
          className="chub-chat-options-menu__item"
          onClick={() => onAction('pin')}
          title="Pin conversation to top"
        >
          Pin
        </button>
        {/* Button to forward conversation message */}
        <button
          type="button"
          className="chub-chat-options-menu__item"
          onClick={() => onAction('forward')}
          title="Forward message to another user"
        >
          Forward
        </button>
        {/* Button to inspect details of the contact or group */}
        <button
          type="button"
          className="chub-chat-options-menu__item"
          onClick={() => onAction('details')}
          title="View participant profile details"
        >
          Details
        </button>
      </div>
    );
  }
}

export default ChatOptionsMenu;
