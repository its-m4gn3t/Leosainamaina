import React from 'react';

const TypingIndicator = ({ typingUsers = [], theme = 'admin' }) => {
  if (!typingUsers || typingUsers.length === 0) return null;

  const getThemeClasses = () => {
    if (theme === 'admin') {
      return {
        container: 'flex items-center gap-2 p-3 backdrop-blur-md bg-white/10 rounded-lg border border-white/30 mb-2',
        text: 'text-gray-300 text-sm',
        dots: 'text-gray-300'
      };
    } else {
      return {
        container: 'flex items-center gap-2 p-3 bg-gray-100 rounded-lg mb-2',
        text: 'text-gray-600 text-sm',
        dots: 'text-gray-600'
      };
    }
  };

  const themeClasses = getThemeClasses();

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].firstName} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].firstName} and ${typingUsers[1].firstName} are typing`;
    } else {
      return `${typingUsers.length} people are typing`;
    }
  };

  return (
    <div className={themeClasses.container}>
      <span className={themeClasses.text}>
        {getTypingText()}
      </span>
      <div className={`flex gap-1 ${themeClasses.dots}`}>
        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

export default TypingIndicator;