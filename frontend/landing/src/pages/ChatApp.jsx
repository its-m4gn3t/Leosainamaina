import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axios';

export default function ChatApp() {
  const { memberUser, isMemberAuthenticated } = useStore();
  const {
    isConnected,
    onlineUsers,
    sendMessage,
    joinChat,
    startTyping,
    stopTyping,
    addReaction,
    editMessage,
    deleteMessage,
    markAsRead,
    onNewMessage,
    onMessageUpdated,
    onUserTyping,
    onUserStopTyping
  } = useSocket();

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
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  useEffect(() => {
    if (selectedChat) {
      joinChat(selectedChat._id);
      fetchMessages(selectedChat._id);
    }
  }, [selectedChat, joinChat]);

  // Socket event listeners
  useEffect(() => {
    const unsubscribeNewMessage = onNewMessage((message) => {
      if (selectedChat && message.chat === selectedChat._id) {
        setMessages(prev => [...prev, message]);
        markAsRead(message._id);
      } else {
        // Update unread count
        setUnreadCounts(prev => ({
          ...prev,
          [message.chat]: (prev[message.chat] || 0) + 1
        }));
      }
      fetchChats(); // Update chat list
    });

    const unsubscribeMessageUpdated = onMessageUpdated((message) => {
      if (selectedChat && message.chat === selectedChat._id) {
        setMessages(prev => prev.map(m => m._id === message._id ? message : m));
      }
    });

    const unsubscribeUserTyping = onUserTyping((data) => {
      if (selectedChat && data.chatId === selectedChat._id) {
        setTypingUsers(prev => {
          if (!prev.find(u => u.userId === data.userId)) {
            return [...prev, { userId: data.userId, chatId: data.chatId }];
          }
          return prev;
        });
      }
    });

    const unsubscribeUserStopTyping = onUserStopTyping((data) => {
      setTypingUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    return () => {
      unsubscribeNewMessage?.();
      unsubscribeMessageUpdated?.();
      unsubscribeUserTyping?.();
      unsubscribeUserStopTyping?.();
    };
  }, [selectedChat, onNewMessage, onMessageUpdated, onUserTyping, onUserStopTyping, markAsRead]);

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
      setFriends(response.data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await api.get('/friend-requests');
      setFriendRequests(response.data);
      setPendingRequests(response.data.filter(r => r.receiver._id === memberUser._id && r.status === 'pending'));
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data);
      // Clear unread count for this chat
      setUnreadCounts(prev => ({ ...prev, [chatId]: 0 }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    if (editingMessage) {
      editMessage(editingMessage._id, newMessage.trim());
      setEditingMessage(null);
    } else {
      sendMessage(selectedChat._id, newMessage.trim(), replyTo?._id);
      setReplyTo(null);
    }
    
    setNewMessage('');
    stopTyping(selectedChat._id);
  };

  const handleTyping = () => {
    if (!selectedChat) return;
    
    startTyping(selectedChat._id);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(selectedChat._id);
    }, 3000);
  };

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Delete this message?')) {
      deleteMessage(messageId);
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
      setShowMobileMenu(false);
    } catch (error) {
      console.error('Error creating direct chat:', error);
      alert(error.response?.data?.message || 'Error creating chat');
    }
  };

  const getRequestStatus = (memberId) => {
    const sent = friendRequests.find(r => r.sender._id === memberUser._id && r.receiver._id === memberId);
    const received = friendRequests.find(r => r.receiver._id === memberUser._id && r.sender._id === memberId);
    const isFriend = friends.some(f => f._id === memberId);
    
    if (isFriend) return 'friend';
    if (sent) return sent.status === 'pending' ? 'sent' : sent.status;
    if (received) return received.status === 'pending' ? 'received' : received.status;
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
      {/* Connection Status */}
      <div className={`fixed top-4 right-4 z-50 px-3 py-1 rounded-full text-xs font-medium ${
        isConnected ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

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
          <h1 className="text-xl font-bold text-gray-900">Leo Chat</h1>
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
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Leo Chat</h2>
              {pendingRequests.length > 0 && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </div>
              )}
            </div>
            
            {/* Tabs */}
            <div className="flex bg-white/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'chats' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                💬 Chats
              </button>
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${
                  activeTab === 'friends' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80 hover:text-white'
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
                  activeTab === 'discover' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80 hover:text-white'
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
                    {chats.map(chat => {
                      const unreadCount = unreadCounts[chat._id] || 0;
                      const isOnline = chat.participants?.some(p => 
                        p._id !== memberUser._id && onlineUsers.has(p._id)
                      );
                      
                      return (
                        <div
                          key={chat._id}
                          onClick={() => {
                            setSelectedChat(chat);
                            setShowMobileMenu(false);
                          }}
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors relative ${
                            selectedChat?._id === chat._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="relative">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                                chat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                              }`}>
                                {chat.type === 'group' ? '👥' : chat.name[0]?.toUpperCase()}
                              </div>
                              {isOnline && chat.type !== 'group' && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-medium text-gray-900 truncate">
                                  {chat.type === 'group' 
                                    ? chat.name 
                                    : chat.participants?.find(p => p._id !== memberUser._id)?.firstName + ' ' + chat.participants?.find(p => p._id !== memberUser._id)?.lastName || 'Unknown'
                                  }
                                </p>
                                {unreadCount > 0 && (
                                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {chat.type === 'group' ? `${chat.participants?.length || 0} members` : 
                                 isOnline ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-medium">
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
                      {friends.map(friend => {
                        const isOnline = onlineUsers.has(friend._id);
                        return (
                          <div
                            key={friend._id}
                            onClick={() => createDirectChat(friend._id)}
                            className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors group"
                          >
                            <div className="relative">
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                                {friend.firstName[0]?.toUpperCase()}
                              </div>
                              {isOnline && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                              )}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-900">{friend.firstName} {friend.lastName}</p>
                              <p className="text-sm text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Chat</span>
                            </div>
                          </div>
                        );
                      })}
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
                    const isOnline = onlineUsers.has(member._id);
                    return (
                      <div key={member._id} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                            {member.firstName[0]?.toUpperCase()}
                          </div>
                          {isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                          <p className="text-sm text-gray-500">{isOnline ? 'Online' : member.email}</p>
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
              <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
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
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3 ${
                        selectedChat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}>
                        {selectedChat.type === 'group' ? '👥' : selectedChat.name[0]?.toUpperCase()}
                      </div>
                      {selectedChat.type !== 'group' && selectedChat.participants?.some(p => 
                        p._id !== memberUser._id && onlineUsers.has(p._id)
                      ) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
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
                          : selectedChat.participants?.some(p => p._id !== memberUser._id && onlineUsers.has(p._id)) ? 'Online' : 'Offline'
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
                              <div className="text-xs text-gray-600 mb-1 px-1">
                                {item.sender?.firstName} {item.sender?.lastName}
                              </div>
                            )}

                            {/* Reply Context */}
                            {item.replyTo && (
                              <div className="bg-gray-100 border-l-4 border-blue-500 p-2 mb-1 rounded text-xs max-w-full">
                                <div className="text-gray-600 truncate">
                                  Replying to: {item.replyTo.content}
                                </div>
                              </div>
                            )}

                            {/* Message Bubble */}
                            <div className={`relative px-4 py-2 rounded-2xl shadow-sm group ${
                              isOwnMessage
                                ? 'bg-blue-500 text-white rounded-br-md'
                                : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
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
                                      className="bg-gray-100 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-gray-200"
                                      onClick={() => handleReaction(item._id, emoji)}
                                    >
                                      {emoji} {count}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Message Actions */}
                              <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white shadow-lg rounded-lg p-1 border`}>
                                <button
                                  onClick={() => handleReaction(item._id, '👍')}
                                  className="p-1 hover:bg-gray-100 rounded text-sm"
                                  title="React"
                                >
                                  😊
                                </button>
                                <button
                                  onClick={() => setReplyTo(item)}
                                  className="p-1 hover:bg-gray-100 rounded text-sm"
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
                                      className="p-1 hover:bg-gray-100 rounded text-sm"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMessage(item._id)}
                                      className="p-1 hover:bg-gray-100 rounded text-sm text-red-500"
                                      title="Delete"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Message Info */}
                            <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                              <span>{formatTime(item.createdAt)}</span>
                              {isOwnMessage && (
                                <span className="text-blue-500">
                                  ✓✓
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Own Avatar */}
                          {isOwnMessage && !item.isGrouped && (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                              {item.sender?.firstName?.[0] || 'M'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Typing Indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg mb-2">
                        <span className="text-gray-600 text-sm">
                          {typingUsers.length === 1 ? 'Someone is typing' : `${typingUsers.length} people are typing`}
                        </span>
                        <div className="flex gap-1">
                          <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    )}
                    
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
                  <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                    {/* Message Input */}
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Leo Chat</h3>
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