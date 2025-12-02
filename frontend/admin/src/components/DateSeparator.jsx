import React from 'react';

const DateSeparator = ({ date, theme = 'admin' }) => {
  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(today - messageDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return messageDate.toLocaleDateString([], { weekday: 'long' });
    return messageDate.toLocaleDateString();
  };

  const getThemeClasses = () => {
    if (theme === 'admin') {
      return 'backdrop-blur-md bg-white/20 text-gray-300 text-xs px-3 py-1 rounded-full border border-white/30';
    } else {
      return 'bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full';
    }
  };

  return (
    <div className="flex justify-center my-4">
      <span className={getThemeClasses()}>
        {formatDate(date)}
      </span>
    </div>
  );
};

export default DateSeparator;