import React, { useState } from 'react';

export default function MessageBubbleNew({ message, isOwnMessage, memberUser }) {
  const [showTime, setShowTime] = useState(false);

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {message.sender?.firstName?.[0] || 'U'}
          </div>
        )}
        
        {/* Message Container */}
        <div 
          className={`relative px-4 py-3 rounded-2xl shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
            isOwnMessage 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md'
          }`}
          onClick={() => setShowTime(!showTime)}
        >
          {/* Sender Name for group chats */}
          {!isOwnMessage && message.sender && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
              {message.sender.firstName} {message.sender.lastName}
            </p>
          )}
          
          {/* Message Content */}
          <p className="text-sm leading-relaxed break-words">{message.content}</p>
          
          {/* Message Status */}
          {isOwnMessage && (
            <div className="flex items-center justify-end mt-1 gap-1">
              <span className="text-xs text-blue-100 opacity-75">
                {formatTime(message.createdAt)}
              </span>
              <div className="text-blue-100 opacity-75">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Time tooltip */}
          {showTime && !isOwnMessage && (
            <div className="absolute -bottom-6 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
              {formatTime(message.createdAt)}
            </div>
          )}
        </div>
        
        {/* Own Avatar */}
        {isOwnMessage && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {memberUser?.firstName?.[0] || 'M'}
          </div>
        )}
      </div>
    </div>
  );
}