import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../api/axios';
import MessageBubbleNew from '../components/MessageBubbleNew';

export default function MessagesNew() {
  const { memberUser, isMemberAuthenticated } = useStore();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😀', '😂', '❤️', '👍', '👎', '😮', '😢', '😡', '🎉', '🔥', '💯', '👏'];

  useEffect(() => {
    if (memberUser && isMemberAuthenticated) {
      fetchChats();
      fetchMembers();
      fetchFriends();
      fetchFriendRequests();
    }
  }, [memberUser, isMemberAuthenticated]);

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

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data.filter(m => m.isActive && m._id !== memberUser._id));
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await api.get('/friend-requests/friends');
      setFriends(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await api.get('/friend-requests');
      const requests = Array.isArray(response.data) ? response.data : [];
      setFriendRequests(requests);
      setPendingRequests(requests.filter(r => r?.receiver?._id === memberUser?._id && r?.status === 'pending'));
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setFriendRequests([]);
      setPendingRequests([]);
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

  const sendFriendRequest = async (memberId) => {
    try {
      await api.post('/friend-requests', {
        receiverId: memberId,
        message: 'Hi! Let\'s connect on Leo Club.'
      });
      fetchFriendRequests();
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  const updateFriendRequest = async (requestId, status) => {
    try {
      await api.put(`/friend-requests/${requestId}`, { status });
      fetchFriendRequests();
      if (status === 'accepted') {
        fetchFriends();
      }
    } catch (error) {
      console.error('Error updating friend request:', error);
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
      alert(error.response?.data?.message || 'Error creating chat');
    }
  };

  const getRequestStatus = (memberId) => {
    if (!memberUser?._id || !memberId) return 'none';
    
    const sent = friendRequests.find(r => r?.sender?._id === memberUser._id && r?.receiver?._id === memberId);
    const received = friendRequests.find(r => r?.receiver?._id === memberUser._id && r?.sender?._id === memberId);
    const isFriend = friends.some(f => f?._id === memberId);
    
    if (isFriend) return 'friend';
    if (sent) return sent?.status === 'pending' ? 'sent' : sent?.status || 'none';
    if (received) return received?.status === 'pending' ? 'received' : received?.status || 'none';
    return 'none';
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

  const getAvatarColor = (id) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-lime-500', 'bg-rose-500'
    ];
    const hash = id?.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
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

  if (!memberUser || !isMemberAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
          <div className="text-6xl mb-4 text-center">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Access Denied</h1>
          <p className="text-gray-600 mb-6 text-center">Please log in to access messages.</p>
          <div className="text-center">
            <Link to="/member-login" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg">
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
        </div>
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Link>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={`${showMobileMenu ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col absolute lg:relative z-10 h-full lg:h-auto`}>
          {/* Desktop Header */}
          <div className="hidden lg:block p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              {pendingRequests.length > 0 && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'chats' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💬 Chats
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${
                  activeTab === 'friends' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                👥 Friends
                {pendingRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'discover' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔍 Discover
              </button>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div className="lg:hidden p-4 border-b border-gray-200">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'chats' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                💬 Chats
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'friends' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                👥 Friends
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'discover' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                🔍 Discover
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Chats Tab */}
            {activeTab === 'chats' && (
              <div className="h-full">
                {chats.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      💬
                    </div>
                    <p className="text-gray-600 mb-2">No conversations yet</p>
                    <p className="text-sm text-gray-400">Connect with friends to start chatting</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {chats.map(chat => (
                      <div
                        key={chat._id}
                        onClick={() => {
                          setSelectedChat(chat);
                          fetchMessages(chat._id);
                          setShowMobileMenu(false);
                        }}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedChat?._id === chat._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                            chat.type === 'group' ? 'bg-purple-500' : getAvatarColor(chat._id)
                          }`}>
                            {chat.type === 'group' ? '👥' : (
                              chat.participants?.find(p => p._id !== memberUser._id)?.firstName?.[0]?.toUpperCase() || 'U'
                            )}
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 truncate">
                                {chat.type === 'group' 
                                  ? chat.name 
                                  : chat.participants?.find(p => p._id !== memberUser._id)?.firstName + ' ' + chat.participants?.find(p => p._id !== memberUser._id)?.lastName || 'Unknown'
                                }
                              </p>
                              {chat.type === 'group' && (
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">Group</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              {chat.type === 'group' ? `${chat.participants?.length || 0} members` : 'Direct message'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
              <div className="h-full">
                {/* Pending Requests */}
                {pendingRequests.length > 0 && (
                  <div className="bg-yellow-50 border-b border-yellow-200">
                    <div className="p-4">
                      <h3 className="font-semibold text-yellow-800 mb-3">Friend Requests ({pendingRequests.length})</h3>
                      <div className="space-y-3">
                        {pendingRequests.map(request => (
                          <div key={request._id} className="bg-white p-3 rounded-lg border border-yellow-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(request.sender._id)}`}>
                                  {request.sender.firstName[0]?.toUpperCase()}
                                </div>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{request.sender.firstName} {request.sender.lastName}</p>
                                  <p className="text-sm text-gray-500">Wants to connect</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => updateFriendRequest(request._id, 'accepted')}
                                  className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => updateFriendRequest(request._id, 'rejected')}
                                  className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm hover:bg-gray-400 transition-colors"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Friends List */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">My Friends ({friends.length})</h3>
                  {friends.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        👥
                      </div>
                      <p className="text-gray-600 mb-2">No friends yet</p>
                      <p className="text-sm text-gray-400">Discover and connect with other members</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {friends.map(friend => (
                        <div
                          key={friend._id}
                          onClick={() => createDirectChat(friend._id)}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors group"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(friend._id)}`}>
                            {friend.firstName[0]?.toUpperCase()}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-gray-900">{friend.firstName} {friend.lastName}</p>
                            <p className="text-sm text-gray-500">Friend</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Chat</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Discover Tab */}
            {activeTab === 'discover' && (
              <div className="h-full p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Discover Members</h3>
                <div className="space-y-2">
                  {members.map(member => {
                    const status = getRequestStatus(member._id);
                    return (
                      <div key={member._id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${getAvatarColor(member._id)}`}>
                          {member.firstName[0]?.toUpperCase()}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-gray-500">Leo Club Member</p>
                        </div>
                        <div>
                          {status === 'none' && (
                            <button
                              onClick={() => sendFriendRequest(member._id)}
                              className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                            >
                              Connect
                            </button>
                          )}
                          {status === 'sent' && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Request Sent</span>
                          )}
                          {status === 'friend' && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Friends</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={() => setShowMobileMenu(true)}
                      className="lg:hidden p-2 hover:bg-gray-100 rounded-lg mr-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3 ${
                      selectedChat.type === 'group' ? 'bg-purple-500' : getAvatarColor(selectedChat._id)
                    }`}>
                      {selectedChat.type === 'group' ? '👥' : selectedChat.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedChat.type === 'group' 
                          ? selectedChat.name 
                          : selectedChat.participants?.find(p => p._id !== memberUser._id)?.firstName + ' ' + selectedChat.participants?.find(p => p._id !== memberUser._id)?.lastName || 'Unknown'
                        }
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedChat.type === 'group' 
                          ? `${selectedChat.participants?.length || 0} members`
                          : 'Direct message'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        💬
                      </div>
                      <p className="text-gray-500 mb-2">No messages yet</p>
                      <p className="text-sm text-gray-400">Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupMessagesByDate(messages).map((item, index) => {
                      if (item.type === 'date') {
                        return (
                          <div key={`date-${index}`} className="flex justify-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                              {formatDate(item.date)}
                            </span>
                          </div>
                        );
                      }
                      
                      const isOwnMessage = item.sender._id === memberUser._id;
                      return (
                        <MessageBubbleNew
                          key={item._id}
                          message={item}
                          isOwnMessage={isOwnMessage}
                          isGrouped={item.isGrouped}
                          onReact={handleReaction}
                          onReply={setReplyTo}
                          onEdit={(msg) => {
                            setEditingMessage(msg);
                            setNewMessage(msg.content);
                          }}
                          onDelete={handleDeleteMessage}
                          theme="member"
                        />
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 bg-white">
                {/* Reply/Edit Context */}
                {(replyTo || editingMessage) && (
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-500">
                        {editingMessage ? '✏️ Editing message' : '↩️ Replying to'}
                      </span>
                      <span className="text-gray-600 truncate max-w-xs">
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
                      className="text-gray-400 hover:text-gray-600 p-1"
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
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                        rows="1"
                        style={{
                          minHeight: '40px',
                          height: 'auto',
                          overflowY: newMessage.split('\n').length > 3 ? 'scroll' : 'hidden'
                        }}
                      />
                      
                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-full mb-2 right-0 bg-white shadow-lg rounded-lg border p-3 grid grid-cols-6 gap-2 z-10">
                          {emojis.map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setNewMessage(newMessage + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="p-2 hover:bg-gray-100 rounded text-lg"
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
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  💬
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Messages</h3>
                <p className="text-gray-500 mb-4">Select a conversation or start a new one</p>
                <button
                  onClick={() => {
                    setActiveTab('friends');
                    setShowMobileMenu(true);
                  }}
                  className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Browse Friends
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}