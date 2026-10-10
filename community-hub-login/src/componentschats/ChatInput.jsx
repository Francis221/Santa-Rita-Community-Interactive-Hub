import React from 'react';
import { Plus, ArrowUp, Smile, Image as ImageIcon, FileText, CheckSquare, Square } from 'lucide-react';

const EMOJIS = ['👍', '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'];

class ChatInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({ text: e.target.value });
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSubmit();
    }
  }

  handleSubmit() {
    const trimmed = this.state.text.trim();
    if (trimmed) {
      this.props.onSendMessage(trimmed);
      this.setState({ text: '' });
    }
  }

  render() {
    const {
      isAttachmentOpen,
      isEmojiOpen,
      attachmentTypes,
      onToggleAttachment,
      onToggleEmoji,
      onAddEmoji,
      onSendAttachment,
    } = this.props;

    return (
      <div className="chub-chat-input-area">
        {/* Attachment Card Popover */}
        {isAttachmentOpen && (
          <div className="chub-chat-attachment-popover">
            <button
              type="button"
              className={`chub-chat-attachment-item ${attachmentTypes?.images ? 'chub-chat-attachment-item--active' : ''}`}
              onClick={() => onSendAttachment('images')}
            >
              {attachmentTypes?.images ? <CheckSquare size={18} /> : <Square size={18} />}
              <span>Images</span>
            </button>

            <button
              type="button"
              className={`chub-chat-attachment-item ${attachmentTypes?.files ? 'chub-chat-attachment-item--active' : ''}`}
              onClick={() => onSendAttachment('files')}
            >
              {attachmentTypes?.files ? <CheckSquare size={18} /> : <Square size={18} />}
              <span>Files</span>
            </button>
          </div>
        )}

        {/* Emoji Picker Popover */}
        {isEmojiOpen && (
          <div className="chub-chat-emoji-popover">
            <div className="chub-chat-emoji-header">emoji</div>
            <div className="chub-chat-emoji-grid">
              {EMOJIS.map((emoji, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="chub-chat-emoji-btn"
                  onClick={() => {
                    this.setState((prev) => ({ text: prev.text + emoji }));
                    onAddEmoji(emoji);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="chub-chat-input-bar">
          <button
            type="button"
            className={`chub-chat-input-bar__action-btn ${
              isAttachmentOpen ? 'chub-chat-input-bar__action-btn--active' : ''
            }`}
            onClick={onToggleAttachment}
            title="Attach File"
          >
            <Plus size={18} />
          </button>

          <input
            type="text"
            className="chub-chat-input-bar__field"
            placeholder="Type a message..."
            value={this.state.text}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
          />

          <button
            type="button"
            className={`chub-chat-input-bar__emoji-btn ${
              isEmojiOpen ? 'chub-chat-input-bar__emoji-btn--active' : ''
            }`}
            onClick={onToggleEmoji}
            title="Add Emoji"
          >
            <Smile size={20} />
          </button>

          <button
            type="button"
            className="chub-chat-input-bar__send-btn"
            onClick={this.handleSubmit}
            title="Send Message"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    );
  }
}

export default ChatInput;
