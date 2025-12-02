import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../api/axios';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import DateSeparator from '../components/DateSeparator';

export default function Messages() {
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
  const [typingUsers, setTypingUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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

  const fetchMessages = async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (messageData) => {
    if (!selectedChat) return;

    try {
      if (messageData.type === 'edit') {
        const response = await api.put(`/chats/messages/${messageData.messageId}`, {
          content: messageData.content
        });
        setMessages(messages.map(m => m._id === messageData.messageId ? response.data : m));
      } else {
        const response = await api.post(`/chats/${selectedChat._id}/messages`, messageData);
        setMessages([...messages, response.data]);
        fetchChats();
      }
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

  const handleTyping = async () => {
    if (!selectedChat) return;
    
    try {
      await api.post(`/chats/${selectedChat._id}/typing`);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        api.post(`/chats/${selectedChat._id}/stop-typing`);
      }, 3000);
    } catch (error) {
      console.error('Error sending typing indicator:', error);
    }
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
      
      // Check if message should be grouped with previous
      const prevMessage = messages[index - 1];
      const isGrouped = prevMessage && 
        prevMessage.sender._id === message.sender._id &&
        new Date(message.createdAt) - new Date(prevMessage.createdAt) < 120000; // 2 minutes
      
      grouped.push({ ...message, type: 'message', isGrouped });
    });
    
    return grouped;
  };

  const createDirectChat = async (memberId) => {
    try {
      const response = await api.post('/chats/direct', {
        participantId: memberId
      });
      fetchChats();
      setSelectedChat(response.data);
      fetchMessages(response.data._id);
      setShowMemberList(false);
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

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  if (!memberUser || !isMemberAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
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
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="h-full max-w-7xl mx-auto">
        <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl shadow-2xl overflow-hidden h-full">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
              {/* Header */}
              <div className="p-6 bg-white border-b border-gray-200">
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

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {/* Chats Tab */}
                {activeTab === 'chats' && (
                  <div className="h-full overflow-y-auto">
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
                            onClick={() => handleChatSelect(chat)}
                            className={`p-4 cursor-pointer hover:bg-white transition-colors ${
                              selectedChat?._id === chat._id ? 'bg-white border-r-2 border-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                                chat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                              }`}>
                                {chat.type === 'group' ? '👥' : chat.name[0]?.toUpperCase()}
                              </div>
                              <div className="ml-3 flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {chat.type === 'group' 
                                    ? chat.name 
                                    : chat.participants?.find(p => p._id !== memberUser._id)?.firstName + ' ' + chat.participants?.find(p => p._id !== memberUser._id)?.lastName || 'Unknown'
                                  }
                                </p>
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
                  <div className="h-full overflow-y-auto">
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
                          {friends.map(friend => (
                            <div
                              key={friend._id}
                              onClick={() => createDirectChat(friend._id)}
                              className="flex items-center p-3 hover:bg-white cursor-pointer rounded-lg transition-colors group"
                            >
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
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
                  <div className="h-full overflow-y-auto p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Discover Members</h3>
                    <div className="space-y-2">
                      {members.map(member => {
                        const status = getRequestStatus(member._id);
                        return (
                          <div key={member._id} className="flex items-center p-3 hover:bg-white rounded-lg transition-colors">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              {member.firstName[0]?.toUpperCase()}
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                              <p className="text-sm text-gray-500">{member.email}</p>
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

            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <h3 className="font-semibold">
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

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {groupMessagesByDate(messages).map((item, index) => {
                      if (item.type === 'date') {
                        return <DateSeparator key={`date-${index}`} date={item.date} />;
                      }
                      
                      const isOwnMessage = item.sender._id === memberUser._id;
                      return (
                        <MessageBubble
                          key={item._id}
                          message={item}
                          isOwnMessage={isOwnMessage}
                          isGrouped={item.isGrouped}
                          onReact={handleReaction}
                          onReply={setReplyTo}
                          onEdit={setEditingMessage}
                          onDelete={handleDeleteMessage}
                        />
                      );
                    })}
                    
                    <TypingIndicator typingUsers={typingUsers} />
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <ChatInput
                    onSendMessage={sendMessage}
                    onTyping={handleTyping}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                    editingMessage={editingMessage}
                    onCancelEdit={() => setEditingMessage(null)}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <p className="text-gray-500 mb-2">Select a chat to start messaging</p>
                    <p className="text-sm text-gray-400">Connect with other Leo Club members</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}