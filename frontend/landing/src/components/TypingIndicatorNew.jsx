import React from 'react';

export default function TypingIndicatorNew({ typingUsers = [] }) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 mb-4">
      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
        👤
      </div>
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-3 rounded-bl-md">
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {typingUsers.length === 1 
              ? `${typingUsers[0]} is typing` 
              : `${typingUsers.length} people are typing`
            }
          </span>
          <div className="flex gap-1 ml-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}