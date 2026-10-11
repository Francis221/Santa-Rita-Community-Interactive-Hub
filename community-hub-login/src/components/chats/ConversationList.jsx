import React from 'react';
import { Search, Plus, Users, MessageSquare } from 'lucide-react';

class ConversationList extends React.Component {
  render() {
    const {
      conversations,
      activeId,
      filter,
      searchQuery,
      onSelectConversation,
      onFilterChange,
      onSearchChange,
      onOpenNewChatModal,
    } = this.props;

    return (
      /* Left Sidebar Conversations List */
      <div className="chub-chat-sidebar">
        {/* Sidebar Header with New Conversation Button */}
        <div className="chub-chat-sidebar__header">
          <h2 className="chub-chat-sidebar__title">Messages</h2>
          {/* Button to open New Chat creation modal */}
          <button
            type="button"
            className="chub-chat-sidebar__add-btn"
            onClick={onOpenNewChatModal}
            title="Start New Conversation"
            aria-label="New conversation"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Message search input filter */}
        <div className="chub-chat-sidebar__search">
          <Search size={16} className="chub-chat-sidebar__search-icon" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search conversation messages"
          />
        </div>

        {/* Conversation category filter buttons */}
        <div className="chub-chat-sidebar__filters">
          {/* Button to show all conversations */}
          <button
            type="button"
            className={`chub-chat-filter-btn ${filter === 'all' ? 'chub-chat-filter-btn--active' : ''}`}
            onClick={() => onFilterChange('all')}
            title="Show all messages"
          >
            All
          </button>
          {/* Button to filter unread conversations */}
          <button
            type="button"
            className={`chub-chat-filter-btn ${filter === 'unread' ? 'chub-chat-filter-btn--active' : ''}`}
            onClick={() => onFilterChange('unread')}
            title="Show only unread messages"
          >
            Unread
          </button>
          {/* Button to filter group conversations */}
          <button
            type="button"
            className={`chub-chat-filter-btn ${filter === 'groups' ? 'chub-chat-filter-btn--active' : ''}`}
            onClick={() => onFilterChange('groups')}
            title="Show group discussions"
          >
            Groups
          </button>
        </div>

        <div className="chub-chat-sidebar__list">
          {conversations.length === 0 ? (
            <div className="chub-chat-sidebar__empty">No messages found</div>
          ) : (
            conversations.map((chat) => {
              const isActive = chat.id === activeId;
              return (
                <div
                  key={chat.id}
                  className={`chub-conversation-card ${isActive ? 'chub-conversation-card--active' : ''}`}
                  onClick={() => onSelectConversation(chat.id)}
                >
                  <div className="chub-conversation-card__avatar-wrap">
                    {chat.isGroup ? (
                      <div className="chub-conversation-card__avatar chub-conversation-card__avatar--group">
                        <Users size={20} />
                      </div>
                    ) : (
                      <div
                        className="chub-conversation-card__avatar"
                        style={{ backgroundColor: chat.avatarColor || '#6366f1' }}
                      >
                        {chat.initials}
                      </div>
                    )}
                    {!chat.isGroup && (
                      <span
                        className={`chub-conversation-card__status-dot ${
                          chat.isOnline ? 'chub-conversation-card__status-dot--online' : ''
                        }`}
                      />
                    )}
                  </div>

                  <div className="chub-conversation-card__content">
                    <div className="chub-conversation-card__top">
                      <span className="chub-conversation-card__name">{chat.name}</span>
                      <span className="chub-conversation-card__time">{chat.lastTime}</span>
                    </div>
                    <div className="chub-conversation-card__bottom">
                      <p className="chub-conversation-card__preview">{chat.lastMessage}</p>
                      {chat.unreadCount > 0 && (
                        <span className="chub-conversation-card__badge">{chat.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
}

export default ConversationList;
