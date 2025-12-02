import React, { useState } from 'react';

const MessageBubble = ({ 
  message, 
  isOwnMessage, 
  showAvatar = true, 
  isGrouped = false,
  onReact,
  onReply,
  onEdit,
  onDelete,
  theme = 'admin' // 'admin' or 'member'
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const reactions = ['❤️', '😂', '👍', '👎', '😮', '😢', '😡'];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'read': return '✓✓';
      default: return '';
    }
  };

  const getThemeClasses = () => {
    if (theme === 'admin') {
      return {
        ownBubble: 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-md',
        otherBubble: 'backdrop-blur-md bg-white/20 border border-white/30 text-white rounded-bl-md',
        replyContext: 'backdrop-blur-md bg-white/20 border-l-4 border-blue-500 p-2 mb-1 rounded text-xs max-w-full border border-white/30',
        replyText: 'text-gray-300',
        senderName: 'text-gray-400',
        messageInfo: 'text-gray-400',
        reactions: 'backdrop-blur-md bg-white/20 border border-white/30 hover:bg-white/30',
        actions: 'backdrop-blur-md bg-white/20 shadow-lg rounded-lg p-1 border border-white/30',
        actionButton: 'p-1 hover:bg-white/20 rounded text-sm text-white',
        deleteButton: 'p-1 hover:bg-white/20 rounded text-sm text-red-300',
        reactionPicker: 'backdrop-blur-md bg-white/20 shadow-lg rounded-lg border border-white/30 p-2 flex gap-1 z-10'
      };
    } else {
      return {
        ownBubble: 'bg-blue-500 text-white rounded-br-md',
        otherBubble: 'bg-white border border-gray-200 text-gray-900 rounded-bl-md',
        replyContext: 'bg-gray-100 border-l-4 border-blue-500 p-2 mb-1 rounded text-xs max-w-full',
        replyText: 'text-gray-600',
        senderName: 'text-gray-600',
        messageInfo: 'text-gray-500',
        reactions: 'bg-gray-100 hover:bg-gray-200',
        actions: 'bg-white shadow-lg rounded-lg p-1 border',
        actionButton: 'p-1 hover:bg-gray-100 rounded text-sm',
        deleteButton: 'p-1 hover:bg-gray-100 rounded text-sm text-red-500',
        reactionPicker: 'bg-white shadow-lg rounded-lg border p-2 flex gap-1 z-10'
      };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`flex items-end gap-2 mb-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} ${isGrouped ? 'mt-1' : 'mt-4'}`}>
      {/* Avatar */}
      {showAvatar && !isOwnMessage && !isGrouped && (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
          {message.sender?.firstName?.[0] || 'U'}
        </div>
      )}
      {showAvatar && !isOwnMessage && isGrouped && (
        <div className="w-8 h-8 flex-shrink-0"></div>
      )}

      {/* Message Container */}
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {/* Sender Name (for groups, non-own messages) */}
        {!isOwnMessage && !isGrouped && (
          <div className={`text-xs mb-1 px-1 ${themeClasses.senderName}`}>
            {message.sender?.firstName} {message.sender?.lastName}
          </div>
        )}

        {/* Reply Context */}
        {message.replyTo && (
          <div className={themeClasses.replyContext}>
            <div className={`truncate ${themeClasses.replyText}`}>
              Replying to: {message.replyTo.content}
            </div>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl shadow-sm group ${
            isOwnMessage ? themeClasses.ownBubble : themeClasses.otherBubble
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Message Content */}
          <div className="break-words">
            {message.messageType === 'text' && (
              <p className="text-sm leading-relaxed">
                {message.content}
                {message.edited && <span className="text-xs opacity-70 ml-1">(edited)</span>}
              </p>
            )}
            
            {message.messageType === 'image' && (
              <div>
                <img 
                  src={message.fileUrl} 
                  alt="Shared image" 
                  className="max-w-full h-auto rounded-lg mb-2"
                />
                {message.content && <p className="text-sm">{message.content}</p>}
              </div>
            )}
            
            {message.messageType === 'file' && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center">
                  📄
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{message.fileName}</p>
                  <p className="text-xs text-gray-500">{(message.fileSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(
                message.reactions.reduce((acc, reaction) => {
                  acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                  return acc;
                }, {})
              ).map(([emoji, count]) => (
                <span
                  key={emoji}
                  className={`text-xs px-2 py-1 rounded-full cursor-pointer ${themeClasses.reactions}`}
                  onClick={() => onReact?.(message._id, emoji)}
                >
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}

          {/* Message Actions */}
          {showActions && (
            <div className={`absolute top-0 ${isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'} flex items-center gap-1 ${themeClasses.actions}`}>
              <button
                onClick={() => setShowReactions(!showReactions)}
                className={themeClasses.actionButton}
                title="React"
              >
                😊
              </button>
              <button
                onClick={() => onReply?.(message)}
                className={themeClasses.actionButton}
                title="Reply"
              >
                ↩️
              </button>
              {isOwnMessage && (
                <>
                  <button
                    onClick={() => onEdit?.(message)}
                    className={themeClasses.actionButton}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete?.(message._id)}
                    className={themeClasses.deleteButton}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          )}

          {/* Reaction Picker */}
          {showReactions && (
            <div className={`absolute top-full mt-1 ${themeClasses.reactionPicker}`}>
              {reactions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact?.(message._id, emoji);
                    setShowReactions(false);
                  }}
                  className="p-1 hover:bg-gray-100 rounded text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message Info */}
        <div className={`flex items-center gap-1 mt-1 text-xs ${themeClasses.messageInfo} ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
          <span>{formatTime(message.createdAt)}</span>
          {isOwnMessage && (
            <span className={`${message.status === 'read' ? (theme === 'admin' ? 'text-blue-400' : 'text-blue-500') : ''}`}>
              {getStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>

      {/* Own Avatar */}
      {showAvatar && isOwnMessage && !isGrouped && (
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0 ${
          theme === 'admin' ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-green-500'
        }`}>
          {theme === 'admin' ? 'A' : (message.sender?.firstName?.[0] || 'M')}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;