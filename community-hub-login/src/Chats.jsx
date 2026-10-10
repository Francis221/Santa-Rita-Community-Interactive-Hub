import React from 'react';
import ConversationList from './componentschats/ConversationList';
import ChatWindow from './componentschats/ChatWindow';
import NewChatModal from './componentschats/NewChatModal';
import { useAuth } from './context/AuthContext';
import './chats.css';

// Mainframe Class Component for the Community Hub Chats module
class ChatsMainframe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      conversations: [
        {
          id: 'community-hub',
          other_user_id: null,
          name: 'Community Hub',
          role: 'Official Broadcast & Community',
          initials: 'CH',
          avatarColor: '#3b82f6',
          isGroup: true,
          isOnline: true,
          unreadCount: 0,
          lastMessage: 'Connecting to community network...',
          lastTime: '',
        },
      ],
      messagesByConv: {},
      activeConversationId: 'community-hub',
      filter: 'all',
      searchQuery: '',
      isAttachmentOpen: false,
      isOptionsOpen: false,
      isEmojiOpen: false,
      isNewChatModalOpen: false,
      attachmentTypes: {
        images: true,
        files: true,
      },
    };

    this.handleSelectConversation = this.handleSelectConversation.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleToggleAttachment = this.handleToggleAttachment.bind(this);
    this.handleToggleOptions = this.handleToggleOptions.bind(this);
    this.handleToggleEmoji = this.handleToggleEmoji.bind(this);
    this.handleAddEmoji = this.handleAddEmoji.bind(this);
    this.handleSendMessage = this.handleSendMessage.bind(this);
    this.handleSendAttachment = this.handleSendAttachment.bind(this);
    this.handleOptionAction = this.handleOptionAction.bind(this);
    this.handleOpenNewChatModal = this.handleOpenNewChatModal.bind(this);
    this.handleCloseNewChatModal = this.handleCloseNewChatModal.bind(this);
    this.handleCreateNewChat = this.handleCreateNewChat.bind(this);
  }

  getMyId() {
    const { currentUser } = this.props;
    if (currentUser?.id) return Number(currentUser.id);
    if (currentUser?.username?.toLowerCase() === 'justinryan') return 2;
    if (currentUser?.username?.toLowerCase() === 'admin') return 3;
    if (currentUser?.username?.toLowerCase() === 'kyla') return 5;
    return 1;
  }

  getMyUsername() {
    const { currentUser } = this.props;
    return currentUser?.username || 'User';
  }

  componentDidMount() {
    this.loadConversations();
    this.loadActiveMessages(this.state.activeConversationId);
    this.sendOnlineHeartbeat();

    // Short-polling interval for immediate chat responsiveness (1.5 seconds)
    this.chatInterval = setInterval(() => {
      this.loadActiveMessages(this.state.activeConversationId);
    }, 1500);

    // Refresh conversation list & online statuses every 3.5 seconds
    this.convInterval = setInterval(() => {
      this.loadConversations();
    }, 3500);

    // Keep session online
    this.heartbeatInterval = setInterval(() => {
      this.sendOnlineHeartbeat();
    }, 25000);
  }

  componentWillUnmount() {
    if (this.chatInterval) clearInterval(this.chatInterval);
    if (this.convInterval) clearInterval(this.convInterval);
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.activeConversationId !== this.state.activeConversationId) {
      this.loadActiveMessages(this.state.activeConversationId);
    }
  }

  sendOnlineHeartbeat() {
    const myId = this.getMyId();
    const myUsername = this.getMyUsername();
    try {
      fetch('/api/online.php?action=heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user_id: myId, username: myUsername })
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.success) {
            window.dispatchEvent(new Event("statsUpdated"));
          }
        })
        .catch(() => {});
    } catch (e) {}
  }

  loadConversations() {
    const myId = this.getMyId();
    const myUsername = this.getMyUsername();

    fetch(`/api/chats.php?action=conversations&user_id=${myId}&username=${encodeURIComponent(myUsername)}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.conversations)) {
          this.setState(prev => {
            let activeId = prev.activeConversationId;
            const exists = data.conversations.some(c => c.id === activeId);
            if (!exists && data.conversations.length > 0) {
              activeId = data.conversations[0].id;
            }
            return {
              conversations: data.conversations,
              activeConversationId: activeId
            };
          });
        }
      })
      .catch(() => {});
  }

  loadActiveMessages(convId) {
    if (!convId) return;
    const myId = this.getMyId();
    const myUsername = this.getMyUsername();

    fetch(`/api/chats.php?action=fetch&conversation_id=${encodeURIComponent(convId)}&user_id=${myId}&username=${encodeURIComponent(myUsername)}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.messages)) {
          this.setState(prev => ({
            messagesByConv: {
              ...prev.messagesByConv,
              [convId]: data.messages
            }
          }));
        }
      })
      .catch(() => {});
  }

  handleSelectConversation(id) {
    this.setState({
      activeConversationId: id,
      isAttachmentOpen: false,
      isOptionsOpen: false,
      isEmojiOpen: false,
    });
    this.loadActiveMessages(id);
  }

  handleFilterChange(filter) {
    this.setState({ filter });
  }

  handleSearchChange(searchQuery) {
    this.setState({ searchQuery });
  }

  handleToggleAttachment() {
    this.setState((prev) => ({
      isAttachmentOpen: !prev.isAttachmentOpen,
      isEmojiOpen: false,
      isOptionsOpen: false,
    }));
  }

  handleToggleOptions() {
    this.setState((prev) => ({
      isOptionsOpen: !prev.isOptionsOpen,
      isAttachmentOpen: false,
      isEmojiOpen: false,
    }));
  }

  handleToggleEmoji() {
    this.setState((prev) => ({
      isEmojiOpen: !prev.isEmojiOpen,
      isAttachmentOpen: false,
      isOptionsOpen: false,
    }));
  }

  handleAddEmoji(emoji) {
    // Emoji insertion handled in ChatInput
  }

  handleSendMessage(text) {
    const { activeConversationId, conversations } = this.state;
    const myId = this.getMyId();
    const myUsername = this.getMyUsername();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const activeChat = conversations.find((c) => c.id === activeConversationId);

    // Optimistic UI local message
    const tempMsg = {
      id: Date.now(),
      sender_id: myId,
      sender: 'user',
      sender_name: myUsername,
      text,
      time: currentTime,
      created_at: new Date().toISOString(),
      seen: false,
    };

    this.setState((prev) => {
      const existingMsgs = prev.messagesByConv[activeConversationId] || [];
      return {
        messagesByConv: {
          ...prev.messagesByConv,
          [activeConversationId]: [...existingMsgs, tempMsg]
        },
        conversations: prev.conversations.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              lastMessage: text,
              lastTime: currentTime,
            };
          }
          return c;
        }),
        isAttachmentOpen: false,
        isEmojiOpen: false,
      };
    });

    // Post to MySQL database via chats.php
    fetch('/api/chats.php?action=send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        text: text,
        sender_id: myId,
        sender_username: myUsername,
        receiver_id: activeChat?.other_user_id || null,
        receiver_name: activeChat?.username || activeChat?.name || null,
        conversation_id: activeConversationId
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          this.loadActiveMessages(activeConversationId);
          this.loadConversations();
        }
      })
      .catch(e => console.warn('Chat send error:', e));
  }

  handleSendAttachment(type) {
    this.setState((prev) => ({
      attachmentTypes: {
        ...prev.attachmentTypes,
        [type]: !prev.attachmentTypes[type],
      },
    }));
  }

  handleOptionAction(action) {
    const { activeConversationId } = this.state;
    if (action === 'delete' || action === 'clear') {
      try {
        fetch(`/api/chats.php?action=clear&conversation_id=${encodeURIComponent(activeConversationId)}`, {
          credentials: 'include'
        }).catch(() => {});
      } catch (e) {}

      this.setState((prev) => ({
        messagesByConv: {
          ...prev.messagesByConv,
          [activeConversationId]: []
        },
        conversations: prev.conversations.map((c) => {
          if (c.id === activeConversationId) {
            return {
              ...c,
              lastMessage: 'No messages yet',
              lastTime: ''
            };
          }
          return c;
        }),
        isOptionsOpen: false,
      }));
    } else {
      console.log(`Action trigger: ${action} for conversation ${activeConversationId}`);
      this.setState({ isOptionsOpen: false });
    }
  }

  handleOpenNewChatModal() {
    this.setState({ isNewChatModalOpen: true });
  }

  handleCloseNewChatModal() {
    this.setState({ isNewChatModalOpen: false });
  }

  handleCreateNewChat(contact) {
    const myId = this.getMyId();
    const otherId = contact.other_user_id || contact.id;

    let targetConvId = contact.id;
    if (otherId && otherId !== 'community-hub') {
      const minId = Math.min(myId, Number(otherId));
      const maxId = Math.max(myId, Number(otherId));
      targetConvId = `conv_${minId}_${maxId}`;
    }

    this.setState((prev) => {
      const existing = prev.conversations.find((c) => c.id === targetConvId || c.name === contact.name);
      if (existing) {
        return { activeConversationId: existing.id, isNewChatModalOpen: false };
      }

      const initials = (contact.name || 'U')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const newChat = {
        id: targetConvId,
        other_user_id: otherId,
        name: contact.name,
        role: contact.role || 'Resident',
        initials,
        avatarColor: contact.avatarColor || '#6366f1',
        isGroup: false,
        isOnline: Boolean(contact.isOnline),
        unreadCount: 0,
        lastMessage: 'No messages yet',
        lastTime: '',
      };

      return {
        conversations: [newChat, ...prev.conversations],
        activeConversationId: targetConvId,
        isNewChatModalOpen: false,
      };
    });

    this.loadActiveMessages(targetConvId);
  }

  render() {
    const {
      conversations,
      messagesByConv,
      activeConversationId,
      filter,
      searchQuery,
      isAttachmentOpen,
      isOptionsOpen,
      isEmojiOpen,
      isNewChatModalOpen,
      attachmentTypes,
    } = this.state;

    // Filter conversations list
    const filteredConversations = conversations.filter((c) => {
      const matchesSearch =
        (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;
      if (filter === 'unread') return c.unreadCount > 0;
      if (filter === 'groups') return c.isGroup === true;
      return true;
    });

    const activeBase = conversations.find((c) => c.id === activeConversationId);
    const activeChat = activeBase
      ? {
          ...activeBase,
          messages: messagesByConv[activeConversationId] || [],
        }
      : null;

    return (
      <div className="chub-chats-mainframe">
        <ConversationList
          conversations={filteredConversations}
          activeId={activeConversationId}
          filter={filter}
          searchQuery={searchQuery}
          onSelectConversation={this.handleSelectConversation}
          onFilterChange={this.handleFilterChange}
          onSearchChange={this.handleSearchChange}
          onOpenNewChatModal={this.handleOpenNewChatModal}
        />

        <ChatWindow
          chat={activeChat}
          isAttachmentOpen={isAttachmentOpen}
          isOptionsOpen={isOptionsOpen}
          isEmojiOpen={isEmojiOpen}
          attachmentTypes={attachmentTypes}
          onToggleAttachment={this.handleToggleAttachment}
          onToggleOptions={this.handleToggleOptions}
          onToggleEmoji={this.handleToggleEmoji}
          onAddEmoji={this.handleAddEmoji}
          onSendMessage={this.handleSendMessage}
          onSendAttachment={this.handleSendAttachment}
          onOptionAction={this.handleOptionAction}
        />

        {isNewChatModalOpen && (
          <NewChatModal
            conversations={conversations}
            onClose={this.handleCloseNewChatModal}
            onCreateChat={this.handleCreateNewChat}
          />
        )}
      </div>
    );
  }
}

// Wrapper component to provide current logged-in user from AuthContext
export default function Chats() {
  const { user } = useAuth();
  return <ChatsMainframe currentUser={user} />;
}
