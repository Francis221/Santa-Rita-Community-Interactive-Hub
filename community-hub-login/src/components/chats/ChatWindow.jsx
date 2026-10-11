import React from 'react';
import { Search, MoreVertical, Users, ChevronDown } from 'lucide-react';
import ChatInput from './ChatInput';
import ChatOptionsMenu from './ChatOptionsMenu';

/**
 * ChatWindow Component
 * Active chat conversation window, message bubble thread, participant info,
 * options menu, and rock-solid auto-scrolling with quick return-to-bottom button.
 */
class ChatWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showScrollBottomBtn: false,
    };
    // Direct ref to the scrollable messages container
    this.messagesContainerRef = React.createRef();
    this.messagesEndRef = React.createRef();

    this.handleScroll = this.handleScroll.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
  }

  componentDidMount() {
    // Snap to the latest message immediately upon mounting
    this.scrollToBottom(false);
    // Secondary check once DOM renders all message bubble heights
    this.mountTimeout = setTimeout(() => {
      this.scrollToBottom(false);
    }, 80);
  }

  componentWillUnmount() {
    if (this.mountTimeout) clearTimeout(this.mountTimeout);
  }

  componentDidUpdate(prevProps) {
    const isNewConv = prevProps.chat?.id !== this.props.chat?.id;
    const hasNewMsg = (this.props.chat?.messages?.length || 0) > (prevProps.chat?.messages?.length || 0);

    if (isNewConv) {
      // Switching to a new conversation: jump directly to bottom
      this.scrollToBottom(false);
      setTimeout(() => this.scrollToBottom(false), 50);
    } else if (hasNewMsg) {
      // New message received: smoothly scroll down
      this.scrollToBottom(true);
    }
  }

  /**
   * Dedicated scroll-to-bottom function
   * Operates strictly within the chat messages container to prevent outer page jumping.
   */
  scrollToBottom(smooth = false) {
    const container = this.messagesContainerRef?.current;
    if (container) {
      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        container.scrollTop = container.scrollHeight;
      }
    }
  }

  /**
   * Listen to scroll events to reveal the floating "Scroll to bottom" button
   * when user scrolls up more than 150px.
   */
  handleScroll() {
    const container = this.messagesContainerRef?.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const shouldShow = distanceFromBottom > 150;
    if (shouldShow !== this.state.showScrollBottomBtn) {
      this.setState({ showScrollBottomBtn: shouldShow });
    }
  }

  render() {
    const {
      chat,
      isAttachmentOpen,
      isOptionsOpen,
      isEmojiOpen,
      attachmentTypes,
      onToggleAttachment,
      onToggleOptions,
      onToggleEmoji,
      onAddEmoji,
      onSendMessage,
      onSendAttachment,
      onOptionAction,
    } = this.props;

    if (!chat) {
      return (
        /* Empty State Placeholder when no chat conversation is chosen */
        <div className="chub-chat-window chub-chat-window--empty">
          <p>Select a message to start chatting</p>
        </div>
      );
    }

    return (
      /* Main Chat Window Frame */
      <div className="chub-chat-window">
        {/* Chat Window Header with user identity and action buttons */}
        <div className="chub-chat-window__header">
          <div className="chub-chat-window__user-info">
            {/* User or Group Avatar */}
            <div className="chub-chat-window__avatar-wrap">
              {chat.isGroup ? (
                <div className="chub-chat-window__avatar chub-chat-window__avatar--group">
                  <Users size={22} />
                </div>
              ) : (
                <div
                  className="chub-chat-window__avatar"
                  style={{ backgroundColor: chat.avatarColor || '#ec4899' }}
                >
                  {chat.initials}
                </div>
              )}
              {!chat.isGroup && (
                <span
                  className={`chub-chat-window__status-dot ${
                    chat.isOnline ? 'chub-chat-window__status-dot--online' : ''
                  }`}
                />
              )}
            </div>
            <div>
              <h3 className="chub-chat-window__name">{chat.name}</h3>
              <p className="chub-chat-window__sub">
                {chat.role} {chat.isOnline ? '· Online' : ''}
              </p>
            </div>
          </div>

          <div className="chub-chat-window__actions">
            {/* Button to search within the current chat conversation */}
            <button type="button" className="chub-chat-header-btn" title="Search in conversation" aria-label="Search messages">
              <Search size={18} />
            </button>

            {/* Chat options popover wrapper */}
            <div className="chub-chat-options-wrapper">
              {/* Button to toggle chat options menu */}
              <button
                type="button"
                className={`chub-chat-header-btn ${isOptionsOpen ? 'chub-chat-header-btn--active' : ''}`}
                onClick={onToggleOptions}
                title="More Options"
                aria-label="More options"
              >
                <MoreVertical size={18} />
              </button>
              {isOptionsOpen && (
                <ChatOptionsMenu
                  onAction={onOptionAction}
                  onClose={onToggleOptions}
                />
              )}
            </div>
          </div>
        </div>

        {/* Message Thread Scrollable Container */}
        <div
          className="chub-chat-window__messages"
          ref={this.messagesContainerRef}
          onScroll={this.handleScroll}
        >
          {/* Date Divider */}
          <div className="chub-chat-divider">
            <span>Today</span>
          </div>

          {/* List of chat message bubbles */}
          {chat.messages && chat.messages.map((msg) => {
            const isOutgoing = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`chub-chat-bubble-wrap ${
                  isOutgoing ? 'chub-chat-bubble-wrap--outgoing' : 'chub-chat-bubble-wrap--incoming'
                }`}
              >
                <div className="chub-chat-bubble">
                  {chat.isGroup && !isOutgoing && msg.sender_name && (
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8', marginBottom: '2px' }}>
                      {msg.sender_name} {msg.sender_role ? `(${msg.sender_role})` : ''}
                    </div>
                  )}
                  <p className="chub-chat-bubble__text">{msg.text}</p>
                  <div className="chub-chat-bubble__meta">
                    <span className="chub-chat-bubble__time">{msg.time}</span>
                    {isOutgoing && (
                      <span className="chub-chat-bubble__status">
                        {msg.seen ? '· Seen' : '· Sent'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {/* Scroll anchor element */}
          <div ref={this.messagesEndRef} />
        </div>

        {/* Floating Button to scroll to the bottom when user scrolled up */}
        {this.state.showScrollBottomBtn && (
          <button
            type="button"
            className="chub-chat-scroll-bottom-btn"
            onClick={() => this.scrollToBottom(true)}
            title="Scroll to latest messages"
            aria-label="Scroll to bottom"
          >
            <ChevronDown size={18} />
          </button>
        )}

        {/* Bottom Chat Message Input Component */}
        <ChatInput
          isAttachmentOpen={isAttachmentOpen}
          isEmojiOpen={isEmojiOpen}
          attachmentTypes={attachmentTypes}
          onToggleAttachment={onToggleAttachment}
          onToggleEmoji={onToggleEmoji}
          onAddEmoji={onAddEmoji}
          onSendMessage={(text) => {
            onSendMessage(text);
            // Snap to bottom when outgoing message is sent
            setTimeout(() => this.scrollToBottom(true), 60);
          }}
          onSendAttachment={onSendAttachment}
        />
      </div>
    );
  }
}

export default ChatWindow;
