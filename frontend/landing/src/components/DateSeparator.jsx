import React from 'react';

const DateSeparator = ({ date }) => {
  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="flex items-center justify-center my-4">
      <div className="flex-1 border-t border-gray-200"></div>
      <div className="px-4 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        {formatDate(date)}
      </div>
      <div className="flex-1 border-t border-gray-200"></div>
    </div>
  );
};

export default DateSeparator;