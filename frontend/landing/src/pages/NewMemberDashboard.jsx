import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../api/axios';

export default function NewMemberDashboard() {
  const { memberUser, isMemberAuthenticated, memberLogout } = useStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (memberUser && isMemberAuthenticated) {
      fetchChats();
      fetchConnectionRequests();
      fetchConnections();
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

  const fetchConnectionRequests = async () => {
    try {
      const response = await api.get('/friend-requests');
      setConnectionRequests(response.data);
    } catch (error) {
      console.error('Error fetching connection requests:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await api.get('/friend-requests/friends');
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const searchByUsername = async () => {
    if (!searchUsername.trim()) return;
    try {
      const response = await api.get(`/members?search=${searchUsername}`);
      setSearchResults(response.data.filter(m => m._id !== memberUser._id && m.isActive));
    } catch (error) {
      console.error('Error searching members:', error);
    }
  };

  const sendConnectionRequest = async (memberId) => {
    try {
      await api.post('/friend-requests', {
        receiverId: memberId,
        message: 'Hi! Let\'s connect on Leo Club.'
      });
      fetchConnectionRequests();
      setSearchResults([]);
      setSearchUsername('');
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleConnectionRequest = async (requestId, status) => {
    try {
      await api.put(`/friend-requests/${requestId}`, { status });
      fetchConnectionRequests();
      if (status === 'accepted') {
        fetchConnections();
      }
    } catch (error) {
      console.error('Error handling connection request:', error);
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
    } catch (error) {
      console.error('Error creating direct chat:', error);
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await api.post(`/chats/${selectedChat._id}/messages`, {
        content: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  if (!memberUser || !isMemberAuthenticated) {
    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl p-8 shadow-xl max-w-md mx-auto">
          <div className="text-6xl mb-4 text-center">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Access Denied</h1>
          <p className="text-gray-600 mb-6 text-center">Please log in to access your dashboard.</p>
          <div className="text-center">
            <Link to="/member-login" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg">
              Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingRequests = connectionRequests.filter(r => r.receiver._id === memberUser._id && r.status === 'pending');

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="h-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-t-2xl p-4 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {memberUser.firstName[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Welcome, {memberUser.firstName}!</h1>
                <p className="text-sm text-gray-600">Leo Club Member Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="backdrop-blur-md bg-white/30 text-gray-700 px-4 py-2 rounded-lg hover:bg-white/40 transition-all duration-300 border border-white/40">
                🏠 Home
              </Link>
              <button
                onClick={memberLogout}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="backdrop-blur-md bg-white/20 border-x border-white/30 p-4">
          <div className="flex space-x-1 bg-white/20 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'dashboard' ? 'backdrop-blur-md bg-white/40 text-gray-800 shadow-lg' : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 relative ${
                activeTab === 'messages' ? 'backdrop-blur-md bg-white/40 text-gray-800 shadow-lg' : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              💬 Messages
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('connections')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'connections' ? 'backdrop-blur-md bg-white/40 text-gray-800 shadow-lg' : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
              }`}
            >
              👥 Connections
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-b-2xl shadow-2xl overflow-hidden flex-1 h-full">
          {activeTab === 'dashboard' && (
            <div className="p-6 h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="backdrop-blur-md bg-white/30 rounded-xl p-6 border border-white/40">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Connections</p>
                      <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
                    </div>
                  </div>
                </div>
                <div className="backdrop-blur-md bg-white/30 rounded-xl p-6 border border-white/40">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Active Chats</p>
                      <p className="text-2xl font-bold text-gray-900">{chats.length}</p>
                    </div>
                  </div>
                </div>
                <div className="backdrop-blur-md bg-white/30 rounded-xl p-6 border border-white/40">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-3 rounded-full">
                      <span className="text-2xl">📬</span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/30 rounded-xl p-6 border border-white/40">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('connections')}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg"
                  >
                    🔍 Find New Connections
                  </button>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                  >
                    💬 Start Messaging
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="h-full flex">
              {/* Chat Sidebar */}
              <div className="w-80 border-r border-white/20 flex flex-col">
                <div className="p-4 border-b border-white/20">
                  <h3 className="font-bold text-gray-800 mb-3">Your Chats</h3>
                  {pendingRequests.length > 0 && (
                    <div className="mb-4 p-3 backdrop-blur-md bg-yellow-100/50 rounded-lg border border-yellow-200/50">
                      <p className="text-sm font-medium text-yellow-800 mb-2">
                        {pendingRequests.length} Connection Request(s)
                      </p>
                      <button
                        onClick={() => setActiveTab('connections')}
                        className="text-xs bg-yellow-500 text-white px-2 py-1 rounded"
                      >
                        View Requests
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {chats.map(chat => (
                    <div
                      key={chat._id}
                      onClick={() => handleChatSelect(chat)}
                      className={`p-4 border-b border-white/10 cursor-pointer hover:backdrop-blur-md hover:bg-white/20 transition-all duration-300 ${
                        selectedChat?._id === chat._id ? 'backdrop-blur-md bg-white/30 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                          {chat.name[0]?.toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-gray-800">{chat.name}</p>
                          <p className="text-sm text-gray-600">
                            {chat.type === 'group' ? 'Group Chat' : 'Direct Message'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedChat ? (
                  <>
                    <div className="p-4 border-b border-white/20 backdrop-blur-md bg-white/10">
                      <h3 className="font-bold text-gray-800">{selectedChat.name}</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      {messages.map(message => {
                        const isOwn = message.sender._id === memberUser._id;
                        return (
                          <div key={message._id} className={`mb-4 ${isOwn ? 'text-right' : ''}`}>
                            <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn 
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                                : 'backdrop-blur-md bg-white/40 text-gray-800 border border-white/40'
                            }`}>
                              {!isOwn && (
                                <p className="text-xs font-medium mb-1">{message.sender.firstName}</p>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t border-white/20">
                      <div className="flex">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                          placeholder="Type a message..."
                          className="flex-1 backdrop-blur-md bg-white/30 border border-white/40 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-800 placeholder-gray-600"
                        />
                        <button
                          onClick={sendMessage}
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-r-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">💬</div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Select a Chat</h3>
                      <p className="text-gray-600">Choose a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'connections' && (
            <div className="p-6 h-full overflow-y-auto">
              {/* Search Section */}
              <div className="backdrop-blur-md bg-white/30 rounded-xl p-6 border border-white/40 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Find Members by Username</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    placeholder="Enter username or name..."
                    className="flex-1 backdrop-blur-md bg-white/40 border border-white/40 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-800 placeholder-gray-600"
                  />
                  <button
                    onClick={searchByUsername}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
                  >
                    Search
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {searchResults.map(member => (
                      <div key={member._id} className="flex items-center justify-between p-3 backdrop-blur-md bg-white/40 rounded-lg border border-white/40">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                            {member.firstName[0]?.toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => sendConnectionRequest(member._id)}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                        >
                          Connect
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Requests */}
              {pendingRequests.length > 0 && (
                <div className="backdrop-blur-md bg-white/30 rounded-xl p-6 border border-white/40 mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Connection Requests ({pendingRequests.length})</h3>
                  <div className="space-y-3">
                    {pendingRequests.map(request => (
                      <div key={request._id} className="flex items-center justify-between p-4 backdrop-blur-md bg-yellow-100/50 rounded-lg border border-yellow-200/50">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-medium">
                            {request.sender.firstName[0]?.toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">{request.sender.firstName} {request.sender.lastName}</p>
                            <p className="text-sm text-gray-600">wants to connect</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConnectionRequest(request._id, 'accepted')}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleConnectionRequest(request._id, 'rejected')}
                            className="backdrop-blur-md bg-white/40 text-gray-700 px-3 py-1 rounded-lg hover:bg-white/50 transition-all duration-300 border border-white/40"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* My Connections */}
              <div className="backdrop-blur-md bg-white/30 rounded-xl p-6 border border-white/40">
                <h3 className="text-lg font-bold text-gray-800 mb-4">My Connections ({connections.length})</h3>
                {connections.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">👥</div>
                    <p className="text-gray-600">No connections yet</p>
                    <p className="text-sm text-gray-500 mt-2">Search for members to start connecting</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connections.map(connection => (
                      <div key={connection._id} className="flex items-center justify-between p-4 backdrop-blur-md bg-white/40 rounded-lg border border-white/40">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                            {connection.firstName[0]?.toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">{connection.firstName} {connection.lastName}</p>
                            <p className="text-sm text-gray-600">Connected</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            createDirectChat(connection._id);
                            setActiveTab('messages');
                          }}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                        >
                          Chat
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}