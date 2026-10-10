import React from 'react';
import { X, Search, User } from 'lucide-react';

import { DB } from '../../services/db';

class NewChatModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      search: '',
    };
  }

  render() {
    const { onClose, onCreateChat } = this.props;
    const { search } = this.state;

    const contacts = this.props.contacts || (this.props.conversations ? this.props.conversations.filter(c => !c.isGroup) : null) || DB.getResidents().map((r, i) => ({
      id: r.id || `c-${i}`,
      name: r.name,
      role: r.role || 'Resident',
      avatarColor: ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][i % 5],
    }));

    const filteredContacts = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="chub-chat-modal-overlay" onClick={onClose}>
        <div className="chub-chat-modal" onClick={(e) => e.stopPropagation()}>
          <div className="chub-chat-modal__header">
            <h3>New Message</h3>
            <button type="button" className="chub-chat-modal__close" onClick={onClose}>
              <X size={18} />
            </button>
          </div>

          <div className="chub-chat-modal__search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search contacts or officials..."
              value={search}
              onChange={(e) => this.setState({ search: e.target.value })}
            />
          </div>

          <div className="chub-chat-modal__list">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="chub-chat-modal__contact"
                onClick={() => {
                  onCreateChat(contact);
                  onClose();
                }}
              >
                <div
                  className="chub-chat-modal__avatar"
                  style={{ backgroundColor: contact.avatarColor }}
                >
                  <User size={18} />
                </div>
                <div className="chub-chat-modal__info">
                  <p className="chub-chat-modal__name">{contact.name}</p>
                  <p className="chub-chat-modal__role">{contact.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
}

export default NewChatModal;
