import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { useAdminStore } from '../store/useAdminStore';
import api from '../api/axios';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import TypingIndicator from '../components/TypingIndicator';
import DateSeparator from '../components/DateSeparator';

export default function Messages() {
  const { members, fetchMembers, user, isAuthenticated } = useAdminStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
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
      
      const prevMessage = messages[index - 1];
      const isGrouped = prevMessage && 
        prevMessage.sender._id === message.sender._id &&
        new Date(message.createdAt) - new Date(prevMessage.createdAt) < 120000;
      
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
      console.log('Creating group with:', { name: groupName, participantIds: selectedMembers });
      const response = await api.post('/chats/group', {
        name: groupName.trim(),
        participantIds: selectedMembers
      });
      console.log('Group created:', response.data);
      
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

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
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
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="h-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-t-2xl p-4 mb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                LCS
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Messages</h1>
                <p className="text-sm text-gray-300">Leo Club Management</p>
              </div>
            </div>
            <Link to="/" className="backdrop-blur-md bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-b-2xl shadow-2xl overflow-hidden h-full flex">
          {/* Sidebar */}
          <div className="w-80 backdrop-blur-sm bg-white/5 border-r border-white/20 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Messages</h2>
              
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
                          onClick={() => handleChatSelect(chat)}
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
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-white truncate">
                                  {chat.type === 'group' 
                                    ? chat.name 
                                    : chat.participants?.find(p => p._id !== user?._id)?.firstName + ' ' + chat.participants?.find(p => p._id !== user?._id)?.lastName || 'Member Chat'
                                  }
                                </p>
                                {chat.type === 'group' && (
                                  <span className="bg-purple-500/30 text-purple-200 text-xs px-2 py-1 rounded-full border border-purple-400/30">Group</span>
                                )}
                              </div>
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
                <div className="h-full overflow-y-auto">
                  <div className="p-4">
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Active Members ({members.filter(m => m.isActive).length})</h3>
                      <p className="text-xs text-gray-500">Click to start a conversation</p>
                    </div>
                    
                    <div className="space-y-2">
                      {members.filter(m => m.isActive).map(member => (
                        <div
                          key={member._id}
                          onClick={() => createDirectChat(member._id)}
                          className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors group"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {member.firstName[0]?.toUpperCase()}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Admin Access</span>
                          </div>
                        </div>
                      ))}
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
                <div className="p-6 border-b border-white/20 backdrop-blur-md bg-white/10">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium mr-4 ${
                      selectedChat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                    }`}>
                      {selectedChat.type === 'group' ? '👥' : selectedChat.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {selectedChat.type === 'group' 
                          ? (selectedChat.name || 'Group Chat')
                          : (() => {
                              const otherUser = selectedChat.participants?.find(p => p?._id !== user?._id);
                              return otherUser ? `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim() || 'Member Chat' : 'Member Chat';
                            })()
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

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-transparent to-white/5">
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
                          return <DateSeparator key={`date-${index}`} date={item.date} />;
                        }
                        
                        const isOwnMessage = item.sender?._id === user?._id;
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
                  )}
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
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-white/5">
                <div className="text-center">
                  <div className="w-20 h-20 backdrop-blur-md bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30">
                    💬
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Welcome to Admin Messages</h3>
                  <p className="text-gray-300 mb-4">Select a conversation or start a new one</p>
                  <button
                    onClick={() => setActiveTab('members')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg"
                  >
                    Browse Members
                  </button>
                </div>
              </div>
            )}
          </div>
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