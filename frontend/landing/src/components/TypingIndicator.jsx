import React from 'react';

const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].firstName} is typing...`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].firstName} and ${typingUsers[1].firstName} are typing...`;
    } else {
      return `${typingUsers[0].firstName} and ${typingUsers.length - 1} others are typing...`;
    }
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
          {typingUsers[0]?.firstName?.[0] || '?'}
        </div>
        <span>{getTypingText()}</span>
      </div>
      
      {/* Animated dots */}
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;