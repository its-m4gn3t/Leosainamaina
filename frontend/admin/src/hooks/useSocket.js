import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAdminStore } from '../store/useAdminStore';

export const useSocket = () => {
  const { user, isAuthenticated } = useAdminStore();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    if (!user || !isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // socketRef.current = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001', {
    //   auth: {
    //     token: localStorage.getItem('leo_admin_token')
    //   }
    // });
const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? "https://leosainamina.onrender.com"
    : "http://localhost:5001";

socketRef.current = io(BACKEND_URL, {
  transports: ["websocket"],
  auth: {
    token: localStorage.getItem("leo_member_token"),
    email: memberUser.email,
    password: "leo123",
  },
});

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('user-status-update', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (data.status === 'offline') {
          newSet.delete(data.userId);
        } else {
          newSet.add(data.userId);
        }
        return newSet;
      });
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [user, isAuthenticated]);

  const sendMessage = (chatId, content, replyTo = null) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', {
        chatId,
        content,
        replyTo,
        messageType: 'text'
      });
    }
  };

  const joinChat = (chatId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-chat', chatId);
    }
  };

  const startTyping = (chatId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing-start', chatId);
    }
  };

  const stopTyping = (chatId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing-stop', chatId);
    }
  };

  const addReaction = (messageId, emoji) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('add-reaction', { messageId, emoji });
    }
  };

  const editMessage = (messageId, content) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('edit-message', { messageId, content });
    }
  };

  const deleteMessage = (messageId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('delete-message', messageId);
    }
  };

  const markAsRead = (messageId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('mark-as-read', { messageId });
    }
  };

  const onNewMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
      return () => socketRef.current.off('new-message', callback);
    }
  };

  const onMessageUpdated = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('message-updated', callback);
      return () => socketRef.current.off('message-updated', callback);
    }
  };

  const onUserTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', callback);
      return () => socketRef.current.off('user-typing', callback);
    }
  };

  const onUserStopTyping = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('user-stop-typing', callback);
      return () => socketRef.current.off('user-stop-typing', callback);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    onlineUsers,
    sendMessage,
    joinChat,
    startTyping,
    stopTyping,
    addReaction,
    editMessage,
    deleteMessage,
    markAsRead,
    onNewMessage,
    onMessageUpdated,
    onUserTyping,
    onUserStopTyping
  };
};