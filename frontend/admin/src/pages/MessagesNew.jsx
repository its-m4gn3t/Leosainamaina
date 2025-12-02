import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { useAdminStore } from '../store/useAdminStore';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axios';

export default function MessagesNew() {
  const { members, fetchMembers, user, isAuthenticated } = useAdminStore();
  const {
    isConnected,
    onlineUsers,
    sendMessage: socketSendMessage,
    joinChat,
    startTyping,
    stopTyping,
    addReaction: socketAddReaction,
    editMessage: socketEditMessage,
    deleteMessage: socketDeleteMessage,
    onNewMessage,
    onMessageUpdated,
    onUserTyping,
    onUserStopTyping
  } = useSocket();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😀', '😂', '❤️', '👍', '👎', '😮', '😢', '😡', '🎉', '🔥', '💯', '👏'];

  useEffect(() => {
    fetchMembers();
    fetchChats();
  }, [fetchMembers]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      if (editingMessage) {
        const response = await api.put(`/chats/messages/${editingMessage._id}`, {
          content: newMessage.trim()
        });
        setMessages(messages.map(m => m._id === editingMessage._id ? response.data : m));
        setEditingMessage(null);
      } else {
        const messageData = {
          content: newMessage.trim(),
          replyTo: replyTo?._id
        };
        const response = await api.post(`/chats/${selectedChat._id}/messages`, messageData);
        setMessages([...messages, response.data]);
        fetchChats();
      }
      setNewMessage('');
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const response = await api.post(`/chats/messages/${messageId}/react`, { emoji });
      setMessages(messages.map(m => m._id === messageId ? response.data : m));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    
    try {
      await api.delete(`/chats/messages/${messageId}`);
      setMessages(messages.filter(m => m._id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const createDirectChat = async (memberId) => {
    try {
      const response = await api.post('/chats/direct', {
        participantId: memberId
      });
      fetchChats();
      setSelectedChat(response.data);
      fetchMessages(response.data._id);
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Error creating direct chat:', error);
    }
  };

  const createGroupChat = async () => {
    if (!groupName.trim()) {
      alert('Group name is required');
      return;
    }
    
    if (selectedMembers.length === 0) {
      alert('Please select at least one member');
      return;
    }

    try {
      const response = await api.post('/chats/group', {
        name: groupName.trim(),
        participantIds: selectedMembers
      });
      
      setShowGroupModal(false);
      setGroupName('');
      setSelectedMembers([]);
      fetchChats();
      alert('Group chat created successfully!');
    } catch (error) {
      console.error('Error creating group chat:', error);
      alert(`Failed to create group: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(today - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return messageDate.toLocaleDateString([], { weekday: 'long' });
    return messageDate.toLocaleDateString();
  };

  const groupMessagesByDate = (messages) => {
    const grouped = [];
    let currentDate = null;
    
    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt).toDateString();
      
      if (messageDate !== currentDate) {
        grouped.push({ type: 'date', date: message.createdAt });
        currentDate = messageDate;
      }
      
      const prevMessage = messages[index - 1];
      const isGrouped = prevMessage && 
        prevMessage.sender._id === message.sender._id &&
        new Date(message.createdAt) - new Date(prevMessage.createdAt) < 120000;
      
      grouped.push({ ...message, type: 'message', isGrouped });
    });
    
    return grouped;
  };

  const filteredMembers = members.filter(m => 
    m.isActive && 
    (m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
     m.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
          <div className="text-6xl mb-4 text-center">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-4 text-center">Access Denied</h1>
          <p className="text-gray-300 mb-6 text-center">Please log in to access admin messages.</p>
          <div className="text-center">
            <Link to="/login" className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg">
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden backdrop-blur-md bg-white/10 border-b border-white/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-white/20 rounded-lg text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">Admin Messages</h1>
        </div>
        <Link to="/" className="text-white hover:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${showMobileMenu ? 'block' : 'hidden'} lg:block w-full lg:w-80 backdrop-blur-sm bg-white/5 border-r border-white/20 flex flex-col absolute lg:relative z-10 h-full lg:h-auto`}>
          {/* Desktop Header */}
          <div className="hidden lg:block p-6 border-b border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                LCS
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Admin Messages</h2>
                <p className="text-sm text-gray-300">Leo Club Management</p>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex backdrop-blur-sm bg-white/10 rounded-xl p-1 border border-white/30">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'chats' ? 'backdrop-blur-md bg-white/30 text-white shadow-lg border border-white/40' : 'text-gray-300 hover:text-white hover:bg-white/20'
                }`}
              >
                💬 Chats
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'members' ? 'backdrop-blur-md bg-white/30 text-white shadow-lg border border-white/40' : 'text-gray-300 hover:text-white hover:bg-white/20'
                }`}
              >
                👥 Members
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden p-4 border-b border-white/20">
            <div className="flex backdrop-blur-sm bg-white/10 rounded-xl p-1 border border-white/30">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'chats' ? 'backdrop-blur-md bg-white/30 text-white shadow-lg' : 'text-gray-300'
                }`}
              >
                💬 Chats
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeTab === 'members' ? 'backdrop-blur-md bg-white/30 text-white shadow-lg' : 'text-gray-300'
                }`}
              >
                👥 Members
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chats' && (
              <div className="h-full flex flex-col">
                {/* New Group Button */}
                <div className="p-4 border-b border-white/20">
                  <button
                    onClick={() => setShowGroupModal(true)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                  >
                    ➕ Create Group Chat
                  </button>
                </div>
                
                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                  {chats.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 backdrop-blur-md bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">
                        💬
                      </div>
                      <p className="text-sm text-gray-300">No conversations yet</p>
                      <p className="text-xs text-gray-400 mt-1">Start chatting with members</p>
                    </div>
                  ) : (
                    chats.map(chat => (
                      <div
                        key={chat._id}
                        onClick={() => {
                          setSelectedChat(chat);
                          fetchMessages(chat._id);
                          setShowMobileMenu(false);
                        }}
                        className={`p-4 border-b border-white/10 cursor-pointer hover:backdrop-blur-md hover:bg-white/20 transition-all duration-300 rounded-lg mx-2 my-1 ${
                          selectedChat?._id === chat._id ? 'backdrop-blur-md bg-white/30 border border-white/40 shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                            chat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                            {chat.type === 'group' ? '👥' : chat.name[0]?.toUpperCase()}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="font-medium text-white truncate">
                              {chat.type === 'group' 
                                ? chat.name 
                                : chat.participants?.find(p => p._id !== user?._id)?.firstName + ' ' + chat.participants?.find(p => p._id !== user?._id)?.lastName || 'Member Chat'
                              }
                            </p>
                            <p className="text-sm text-gray-300">
                              {chat.type === 'group' ? `${chat.participants?.length || 0} members` : 'Direct message'}
                            </p>
                          </div>
                          {selectedChat?._id === chat._id && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'members' && (
              <div className="h-full flex flex-col">
                {/* Search */}
                <div className="p-4 border-b border-white/20">
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full backdrop-blur-md bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Members List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-gray-300 mb-2">Active Members ({filteredMembers.length})</h3>
                      <p className="text-xs text-gray-400">Click to start a conversation</p>
                    </div>
                    
                    <div className="space-y-2">
                      {filteredMembers.map(member => (
                        <div
                          key={member._id}
                          onClick={() => createDirectChat(member._id)}
                          className="flex items-center p-3 hover:backdrop-blur-md hover:bg-white/20 cursor-pointer rounded-lg transition-all duration-300 group border border-transparent hover:border-white/30"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {member.firstName[0]?.toUpperCase()}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-white">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-gray-300">{member.email}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full font-medium border border-green-500/30">Admin Access</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col backdrop-blur-sm bg-white/5">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/20 backdrop-blur-md bg-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => setShowMobileMenu(true)}
                      className="lg:hidden p-2 hover:bg-white/20 rounded-lg mr-2 text-white"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium mr-4 ${
                      selectedChat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      {selectedChat.type === 'group' ? '👥' : selectedChat.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {selectedChat.type === 'group' 
                          ? selectedChat.name 
                          : selectedChat.participants?.find(p => p._id !== user?._id)?.firstName + ' ' + selectedChat.participants?.find(p => p._id !== user?._id)?.lastName || 'Member Chat'
                        }
                      </h3>
                      <p className="text-sm text-gray-300">
                        {selectedChat.type === 'group' 
                          ? `${selectedChat.participants?.length || 0} members • Group chat`
                          : 'Direct message • Admin access'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-transparent to-white/5">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 backdrop-blur-md bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                        💬
                      </div>
                      <p className="text-gray-300 mb-2">No messages yet</p>
                      <p className="text-sm text-gray-400">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupMessagesByDate(messages).map((item, index) => {
                      if (item.type === 'date') {
                        return (
                          <div key={`date-${index}`} className="flex justify-center my-4">
                            <span className="backdrop-blur-md bg-white/20 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/30">
                              {formatDate(item.date)}
                            </span>
                          </div>
                        );
                      }
                      
                      const isOwnMessage = item.sender?._id === user?._id;
                      return (
                        <div key={item._id} className={`flex items-end gap-2 mb-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${item.isGrouped ? 'mt-1' : 'mt-4'}`}>
                          {/* Avatar */}
                          {!isOwnMessage && !item.isGrouped && (
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                              {item.sender?.firstName?.[0] || 'U'}
                            </div>
                          )}
                          {!isOwnMessage && item.isGrouped && (
                            <div className="w-8 h-8 flex-shrink-0"></div>
                          )}

                          {/* Message Container */}
                          <div className={`flex flex-col max-w-xs sm:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                            {/* Sender Name */}
                            {!isOwnMessage && !item.isGrouped && (
                              <div className="text-xs text-gray-400 mb-1 px-1">
                                {item.sender?.firstName} {item.sender?.lastName}
                              </div>
                            )}

                            {/* Reply Context */}
                            {item.replyTo && (
                              <div className="backdrop-blur-md bg-white/20 border-l-4 border-blue-500 p-2 mb-1 rounded text-xs max-w-full border border-white/30">
                                <div className="text-gray-300 truncate">
                                  Replying to: {item.replyTo.content}
                                </div>
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`relative px-4 py-2 rounded-2xl shadow-sm group ${
                              isOwnMessage
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-md'
                                : 'backdrop-blur-md bg-white/20 border border-white/30 text-white rounded-bl-md'
                            }`}>
                              {/* Message Content */}
                              <div className="break-words">
                                <p className="text-sm leading-relaxed">
                                  {item.content}
                                  {item.edited && <span className="text-xs opacity-70 ml-1">(edited)</span>}
                                </p>
                              </div>

                              {/* Reactions */}
                              {item.reactions && item.reactions.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {Object.entries(
                                    item.reactions.reduce((acc, reaction) => {
                                      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                      return acc;
                                    }, {})
                                  ).map(([emoji, count]) => (
                                    <span
                                      key={emoji}
                                      className="backdrop-blur-md bg-white/20 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-white/30 border border-white/30"
                                      onClick={() => handleReaction(item._id, emoji)}
                                    >
                                      {emoji} {count}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Message Actions */}
                              <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 backdrop-blur-md bg-white/20 shadow-lg rounded-lg p-1 border border-white/30`}>
                                <button
                                  onClick={() => handleReaction(item._id, '👍')}
                                  className="p-1 hover:bg-white/20 rounded text-sm text-white"
                                  title="React"
                                >
                                  😊
                                </button>
                                <button
                                  onClick={() => setReplyTo(item)}
                                  className="p-1 hover:bg-white/20 rounded text-sm text-white"
                                  title="Reply"
                                >
                                  ↩️
                                </button>
                                {isOwnMessage && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingMessage(item);
                                        setNewMessage(item.content);
                                      }}
                                      className="p-1 hover:bg-white/20 rounded text-sm text-white"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMessage(item._id)}
                                      className="p-1 hover:bg-white/20 rounded text-sm text-red-300"
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Message Info */}
                            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                              <span>{formatTime(item.createdAt)}</span>
                              {isOwnMessage && (
                                <span className="text-blue-400">
                                  ✓✓
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Own Avatar */}
                          {isOwnMessage && !item.isGrouped && (
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                              A
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-white/20 backdrop-blur-md bg-white/10">
                {/* Reply/Edit Context */}
                {(replyTo || editingMessage) && (
                  <div className="px-4 py-2 bg-white/5 border-b border-white/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-400">
                        {editingMessage ? '✏️ Editing message' : '↩️ Replying to'}
                      </span>
                      <span className="text-gray-300 truncate max-w-xs">
                        {editingMessage ? editingMessage.content : replyTo?.content}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        if (editingMessage) {
                          setEditingMessage(null);
                          setNewMessage('');
                        } else {
                          setReplyTo(null);
                        }
                      }}
                      className="text-gray-400 hover:text-gray-300 p-1"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4">
                  <form onSubmit={sendMessage} className="flex items-end gap-2">
                    {/* File Upload */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.txt"
                    />
                    
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Attach file"
                    >
                      📎
                    </button>

                    {/* Message Input */}
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 text-white placeholder-gray-300"
                        rows="1"
                        style={{
                          minHeight: '40px',
                          height: 'auto',
                          overflowY: newMessage.split('\n').length > 3 ? 'scroll' : 'hidden'
                        }}
                      />
                      
                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-full mb-2 right-0 backdrop-blur-md bg-white/20 shadow-lg rounded-lg border border-white/30 p-3 grid grid-cols-6 gap-2 z-10">
                          {emojis.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setNewMessage(newMessage + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="p-2 hover:bg-white/20 rounded text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Emoji Button */}
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Add emoji"
                    >
                      😊
                    </button>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className={`p-2 rounded-lg transition-colors ${
                        newMessage.trim()
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                          : 'bg-white/20 text-gray-400 cursor-not-allowed'
                      }`}
                      title={editingMessage ? 'Save changes' : 'Send message'}
                    >
                      {editingMessage ? '💾' : '➤'}
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-white/5">
              <div className="text-center">
                <div className="w-20 h-20 backdrop-blur-md bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                  💬
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Welcome to Admin Messages</h3>
                <p className="text-gray-300 mb-4">Select a conversation or start a new one</p>
                <button
                  onClick={() => {
                    setActiveTab('members');
                    setShowMobileMenu(true);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                >
                  Browse Members
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Group Chat Modal */}
      <Modal isOpen={showGroupModal} onClose={() => setShowGroupModal(false)} title="Create Group Chat">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter group name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg">
              {members.filter(m => m.isActive).map(member => (
                <label key={member._id} className="flex items-center p-3 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, member._id]);
                      } else {
                        setSelectedMembers(selectedMembers.filter(id => id !== member._id));
                      }
                    }}
                    className="mr-3"
                  />
                  <span>{member.firstName} {member.lastName}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowGroupModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={createGroupChat}
              disabled={!groupName.trim() || selectedMembers.length === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${
                groupName.trim() && selectedMembers.length > 0
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Create Group
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}