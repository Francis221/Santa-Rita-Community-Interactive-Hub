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
        {/* Attachment Options Popover */}
        {isAttachmentOpen && (
          <div className="chub-chat-attachment-popover">
            {/* Button to toggle image attachment option */}
            <button
              type="button"
              className={`chub-chat-attachment-item ${attachmentTypes?.images ? 'chub-chat-attachment-item--active' : ''}`}
              onClick={() => onSendAttachment('images')}
              title="Attach Images"
            >
              {attachmentTypes?.images ? <CheckSquare size={18} /> : <Square size={18} />}
              <span>Images</span>
            </button>

            {/* Button to toggle file/document attachment option */}
            <button
              type="button"
              className={`chub-chat-attachment-item ${attachmentTypes?.files ? 'chub-chat-attachment-item--active' : ''}`}
              onClick={() => onSendAttachment('files')}
              title="Attach Documents or Files"
            >
              {attachmentTypes?.files ? <CheckSquare size={18} /> : <Square size={18} />}
              <span>Files</span>
            </button>
          </div>
        )}

        {/* Emoji Selection Grid Popover */}
        {isEmojiOpen && (
          <div className="chub-chat-emoji-popover">
            <div className="chub-chat-emoji-header">Select an emoji</div>
            <div className="chub-chat-emoji-grid">
              {EMOJIS.map((emoji, idx) => (
                /* Button to insert specific emoji into message text */
                <button
                  key={idx}
                  type="button"
                  className="chub-chat-emoji-btn"
                  onClick={() => {
                    this.setState((prev) => ({ text: prev.text + emoji }));
                    onAddEmoji(emoji);
                  }}
                  title={`Insert emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Chat Message Input Bar */}
        <div className="chub-chat-input-bar">
          {/* Button to toggle attachments menu (Plus icon) */}
          <button
            type="button"
            className={`chub-chat-input-bar__action-btn ${
              isAttachmentOpen ? 'chub-chat-input-bar__action-btn--active' : ''
            }`}
            onClick={onToggleAttachment}
            title="Attach Files or Images"
            aria-label="Attach file"
          >
            <Plus size={18} />
          </button>

          {/* Text Input Field for typing chat message */}
          <input
            type="text"
            className="chub-chat-input-bar__field"
            placeholder="Type a message..."
            value={this.state.text}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            aria-label="Message text"
          />

          {/* Button to open/close emoji picker (Smile icon) */}
          <button
            type="button"
            className={`chub-chat-input-bar__emoji-btn ${
              isEmojiOpen ? 'chub-chat-input-bar__emoji-btn--active' : ''
            }`}
            onClick={onToggleEmoji}
            title="Add Emoji"
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </button>

          {/* Button to submit and send the typed message (ArrowUp icon) */}
          <button
            type="button"
            className="chub-chat-input-bar__send-btn"
            onClick={this.handleSubmit}
            title="Send Message"
            aria-label="Send message"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    );
  }
}

export default ChatInput;
