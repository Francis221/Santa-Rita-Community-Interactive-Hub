import React from 'react';
import { Search, MoreVertical, Users, CheckCheck } from 'lucide-react';
import ChatInput from './ChatInput';
import ChatOptionsMenu from './ChatOptionsMenu';

class ChatWindow extends React.Component {
  constructor(props) {
    super(props);
    this.messagesEndRef = React.createRef();
  }

  componentDidMount() {
    this.scrollToBottom();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.chat?.messages?.length !== this.props.chat?.messages?.length ||
      prevProps.chat?.id !== this.props.chat?.id
    ) {
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    if (this.messagesEndRef.current) {
      this.messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
        <div className="chub-chat-window chub-chat-window--empty">
          <p>Select a message to start chatting</p>
        </div>
      );
    }

    return (
      <div className="chub-chat-window">
        {/* Header */}
        <div className="chub-chat-window__header">
          <div className="chub-chat-window__user-info">
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
            <button type="button" className="chub-chat-header-btn" title="Search in conversation">
              <Search size={18} />
            </button>
            <div className="chub-chat-options-wrapper">
              <button
                type="button"
                className={`chub-chat-header-btn ${isOptionsOpen ? 'chub-chat-header-btn--active' : ''}`}
                onClick={onToggleOptions}
                title="More Options"
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

        {/* Message Thread */}
        <div className="chub-chat-window__messages">
          <div className="chub-chat-divider">
            <span>Today</span>
          </div>

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
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4f46e5', marginBottom: '2px' }}>
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
          <div ref={this.messagesEndRef} />
        </div>

        {/* Bottom Input Section */}
        <ChatInput
          isAttachmentOpen={isAttachmentOpen}
          isEmojiOpen={isEmojiOpen}
          attachmentTypes={attachmentTypes}
          onToggleAttachment={onToggleAttachment}
          onToggleEmoji={onToggleEmoji}
          onAddEmoji={onAddEmoji}
          onSendMessage={onSendMessage}
          onSendAttachment={onSendAttachment}
        />
      </div>
    );
  }
}

export default ChatWindow;
