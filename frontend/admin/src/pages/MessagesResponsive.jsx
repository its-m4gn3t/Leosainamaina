import React, { useState, useEffect, useRef } from 'react';
import Layout from '../layout/Layout';
import Modal from '../components/Modal';
import { useAdminStore } from '../store/useAdminStore';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axios';

export default function MessagesResponsive() {
  const { members, fetchMembers, user, isAuthenticated } = useAdminStore();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const messagesEndRef = useRef(null);

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
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert('Please provide group name and select members');
      return;
    }

    try {
      await api.post('/chats/group', {
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

  return (
    <Layout>
      <div className="flex h-full bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Messages Sidebar */}
        <div className={`${showMobileMenu ? 'block' : 'hidden'} lg:block w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col absolute lg:relative z-10 h-full`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('chats')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'chats' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                💬 Chats
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'members' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
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
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => setShowGroupModal(true)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    ➕ Create Group Chat
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {chats.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        💬
                      </div>
                      <p className="text-sm text-gray-600">No conversations yet</p>
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
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedChat?._id === chat._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${
                            chat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                          }`}>
                            {chat.type === 'group' ? '👥' : chat.name[0]?.toUpperCase()}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="font-medium text-gray-900 truncate">
                              {chat.type === 'group' ? chat.name : 'Member Chat'}
                            </p>
                            <p className="text-sm text-gray-600">
                              {chat.type === 'group' ? `${chat.participants?.length || 0} members` : 'Direct message'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'members' && (
              <div className="h-full overflow-y-auto p-4">
                <div className="space-y-2">
                  {members.filter(m => m.isActive).map(member => (
                    <div
                      key={member._id}
                      onClick={() => createDirectChat(member._id)}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {member.firstName[0]?.toUpperCase()}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="font-medium text-gray-900">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center">
                  <button
                    onClick={() => setShowMobileMenu(true)}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg mr-2"
                  >
                    ←
                  </button>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3 ${
                    selectedChat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}>
                    {selectedChat.type === 'group' ? '👥' : selectedChat.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedChat.type === 'group' ? selectedChat.name : 'Member Chat'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedChat.type === 'group' ? `${selectedChat.participants?.length || 0} members` : 'Direct message'}
                    </p>
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
                      <p className="text-gray-600">No messages yet</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.sender?._id === user?._id;
                      return (
                        <div key={message._id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isOwnMessage 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            {!isOwnMessage && (
                              <p className="text-xs text-gray-500 mb-1">
                                {message.sender?.firstName} {message.sender?.lastName}
                              </p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t border-gray-200 bg-white p-4">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      newMessage.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
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
                  💬
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600 mb-4">Choose from existing chats or start a new one</p>
                <button
                  onClick={() => {
                    setActiveTab('members');
                    setShowMobileMenu(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
    </Layout>
  );
}