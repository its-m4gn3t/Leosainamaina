import React, { useState, useRef } from 'react';

const ChatInput = ({ 
  onSendMessage, 
  onTyping, 
  replyTo, 
  onCancelReply,
  editingMessage,
  onCancelEdit 
}) => {
  const [message, setMessage] = useState(editingMessage?.content || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const emojis = ['😀', '😂', '❤️', '👍', '👎', '😮', '😢', '😡', '🎉', '🔥', '💯', '👏'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (editingMessage) {
      onSendMessage({ 
        type: 'edit', 
        messageId: editingMessage._id, 
        content: message.trim() 
      });
      onCancelEdit?.();
    } else {
      onSendMessage({ 
        content: message.trim(), 
        replyTo: replyTo?._id 
      });
      onCancelReply?.();
    }
    
    setMessage('');
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onSendMessage({ 
        type: 'file', 
        file, 
        content: message.trim() || file.name 
      });
      setMessage('');
    }
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    setMessage(newMessage);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const handleTyping = () => {
    onTyping?.();
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Reply/Edit Context */}
      {(replyTo || editingMessage) && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-blue-500">
              {editingMessage ? '✏️ Editing message' : '↩️ Replying to'}
            </span>
            {(replyTo || editingMessage) && (
              <span className="text-gray-600 truncate max-w-xs">
                {editingMessage ? editingMessage.content : replyTo.content}
              </span>
            )}
          </div>
          <button
            onClick={editingMessage ? onCancelEdit : onCancelReply}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* File Upload */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Attach file"
          >
            📎
          </button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                handleTyping();
              }}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
              rows="1"
              style={{
                minHeight: '40px',
                height: 'auto',
                overflowY: message.split('\n').length > 3 ? 'scroll' : 'hidden'
              }}
            />
            
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-white shadow-lg rounded-lg border p-3 grid grid-cols-6 gap-2 z-10">
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-2 hover:bg-gray-100 rounded text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Emoji Button */}
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add emoji"
          >
            😊
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim()}
            className={`p-2 rounded-lg transition-colors ${
              message.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title={editingMessage ? 'Save changes' : 'Send message'}
          >
            {editingMessage ? '💾' : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInput;