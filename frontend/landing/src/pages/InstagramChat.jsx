import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../api/axios';

export default function InstagramChat() {
  const { memberUser, isMemberAuthenticated } = useStore();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef(null);

  const emojis = ['😀', '😂', '❤️', '👍', '👎', '😮', '😢', '😡', '🎉', '🔥'];

  useEffect(() => {
    if (memberUser && isMemberAuthenticated) {
      fetchChats();
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
      setChats(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    }
  };

  const fetchMessages = async (chatId) => {
    if (!chatId) return;
    try {
      const response = await api.get(`/chats/${chatId}/messages`);
      setMessages(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await api.post(`/chats/${selectedChat._id}/messages`, {
        content: newMessage.trim()
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const getAvatarColor = (id) => {
    const colors = ['bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500'];
    const hash = id?.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  if (!memberUser || !isMemberAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in to access messages</h1>
          <Link to="/member-login" className="bg-blue-500 text-white px-6 py-3 rounded-lg">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">{memberUser.firstName}</h1>
            <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
          <div className="mt-2">
            <h2 className="text-lg font-medium">Messages</h2>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.72-.43l-3.85 1.29a.75.75 0 01-.92-.92l1.29-3.85A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">No messages yet</p>
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat._id}
                onClick={() => {
                  setSelectedChat(chat);
                  fetchMessages(chat._id);
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChat?._id === chat._id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-medium ${
                    chat.type === 'group' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : getAvatarColor(chat._id)
                  }`}>
                    {chat.type === 'group' ? '👥' : (
                      chat.participants?.find(p => p._id !== memberUser._id)?.firstName?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {chat.type === 'group' 
                        ? (chat.name || 'Group Chat')
                        : (() => {
                            const otherUser = chat.participants?.find(p => p?._id !== memberUser?._id);
                            return otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User';
                          })()
                      }
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.lastMessage?.content || 'Start a conversation'}
                    </p>
                  </div>
                  {chat.type === 'group' && (
                    <div className="ml-2">
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                        {chat.participants?.length || 0}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                    selectedChat.type === 'group' ? 'bg-gradient-to-br from-purple-500 to-pink-500' : getAvatarColor(selectedChat._id)
                  }`}>
                    {selectedChat.type === 'group' ? '👥' : (
                      selectedChat.participants?.find(p => p._id !== memberUser._id)?.firstName?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">
                      {selectedChat.type === 'group' 
                        ? (selectedChat.name || 'Group Chat')
                        : (() => {
                            const otherUser = selectedChat.participants?.find(p => p?._id !== memberUser?._id);
                            return otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Unknown User' : 'Unknown User';
                          })()
                      }
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat.type === 'group' ? `${selectedChat.participants?.length || 0} members` : 'Active now'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.72-.43l-3.85 1.29a.75.75 0 01-.92-.92l1.29-3.85A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400 mt-1">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const isOwnMessage = message.sender._id === memberUser._id;
                    const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;
                    
                    return (
                      <div key={message._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                          {!isOwnMessage && showAvatar && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-2 ${getAvatarColor(message.sender._id)}`}>
                              {message.sender.firstName[0]?.toUpperCase()}
                            </div>
                          )}
                          {!isOwnMessage && !showAvatar && (
                            <div className="w-8 mr-2"></div>
                          )}
                          <div className={`px-4 py-2 rounded-2xl ${
                            isOwnMessage 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            <p className="text-sm">{message.content || ''}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={sendMessage} className="flex items-center space-x-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    😊
                  </button>
                  
                  {showEmojiPicker && (
                    <div className="absolute bottom-full mb-2 right-0 bg-white shadow-lg rounded-lg border p-3 grid grid-cols-5 gap-2 z-10">
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
                
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    newMessage.trim()
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.72-.43l-3.85 1.29a.75.75 0 01-.92-.92l1.29-3.85A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Messages</h3>
              <p className="text-gray-500 mb-4">Send private messages to friends and groups</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}