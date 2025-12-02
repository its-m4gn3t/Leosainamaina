import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import api from '../api/axios';
import MessageBubbleNew from '../components/MessageBubbleNew';
import TypingIndicatorNew from '../components/TypingIndicatorNew';

export default function MessagingApp() {
  const { memberUser, isMemberAuthenticated } = useStore();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isMemberAuthenticated) {
      fetchChats();
      fetchMembers();
    }
  }, [isMemberAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await api.get('/chats');
      setChats(response.data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const response = await api.get('/members');
      setMembers(response.data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    
    // Optimistic update
    const tempMessage = {
      _id: Date.now(),
      content: messageContent,
      sender: memberUser,
      createdAt: new Date().toISOString(),
      temp: true
    };
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await api.post(`/chats/${selectedChat._id}/messages`, {
        content: messageContent
      });
      
      // Replace temp message with real one
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? response.data : msg
      ));
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!typing) {
      setTyping(true);
      // In a real app, emit typing event via socket
    }
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      // In a real app, emit stop typing event via socket
    }, 1000);
  };

  const createDirectChat = async (memberId) => {
    try {
      const response = await api.post('/chats/direct', {
        participantId: memberId
      });
      fetchChats();
      setSelectedChat(response.data);
      fetchMessages(response.data._id);
      setShowNewChat(false);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isMemberAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Access Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to access messaging</p>
          <a href="/member-login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Login Now
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden h-[calc(100vh-2rem)]">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 border-r border-gray-200 dark:border-gray-700 flex-col`}>
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ✏️
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {memberUser?.firstName?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {memberUser?.firstName} {memberUser?.lastName}
                    </p>
                    <p className="text-sm text-green-600">Online</p>
                  </div>
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading chats...</p>
                  </div>
                ) : chats.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-gray-600 dark:text-gray-400">No conversations yet</p>
                    <button
                      onClick={() => setShowNewChat(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Start a conversation
                    </button>
                  </div>
                ) : (
                  chats.map(chat => (
                    <div
                      key={chat._id}
                      onClick={() => {
                        setSelectedChat(chat);
                        fetchMessages(chat._id);
                      }}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedChat?._id === chat._id ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                          {chat.type === 'group' ? '👥' : '👤'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {chat.name || 'Chat'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {chat.type === 'group' ? `${chat.participants?.length || 0} members` : 'Direct message'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${selectedChat ? 'flex' : 'hidden lg:flex'} flex-1 flex-col`}>
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedChat(null)}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        ←
                      </button>
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        {selectedChat.type === 'group' ? '👥' : '👤'}
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900 dark:text-gray-100">
                          {selectedChat.name || 'Chat'}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedChat.type === 'group' ? `${selectedChat.participants?.length || 0} members` : 'Direct message'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-gray-900">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-4xl mb-4">💬</div>
                          <p className="text-gray-600 dark:text-gray-400">No messages yet</p>
                          <p className="text-sm text-gray-500 dark:text-gray-500">Start the conversation!</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {messages.map((message) => {
                          const isOwnMessage = message.sender?._id === memberUser?._id;
                          return (
                            <MessageBubbleNew
                              key={message._id}
                              message={message}
                              isOwnMessage={isOwnMessage}
                              memberUser={memberUser}
                            />
                          );
                        })}
                        <TypingIndicatorNew typingUsers={typingUsers} />
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 lg:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <form onSubmit={sendMessage} className="flex gap-2 lg:gap-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                          }
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className={`px-4 lg:px-6 py-3 rounded-2xl font-semibold transition-colors ${
                          newMessage.trim()
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <span className="hidden sm:inline">Send</span>
                        <span className="sm:hidden">→</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Select a conversation</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Choose from existing chats or start a new one</p>
                    <button
                      onClick={() => setShowNewChat(true)}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Start New Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* New Chat Modal */}
        {showNewChat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Start New Chat</h3>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {members.filter(m => m._id !== memberUser?._id && m.isActive).map(member => (
                  <div
                    key={member._id}
                    onClick={() => createDirectChat(member._id)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.firstName[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}