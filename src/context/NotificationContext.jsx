import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { isLoggedIn } from '../Services/checkLogin';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '../Services/notificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const loginCheckInterval = useRef(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn());

  const fetchNotificationList = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications history:', err.message);
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Determine WS URL based on VITE_API_BASE_URL or fallback to localhost:5000
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const wsUrl = apiBase.replace(/^http/, 'ws').replace(/\/api\/?$/, '') + `?token=${token}`;

    if (socketRef.current) {
      socketRef.current.close();
    }

    console.log('[WS] Connecting to', wsUrl);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected to notification server');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'NOTIFICATION_RECEIVED') {
          console.log('[WS] New notification received:', data.payload);
          setNotifications((prev) => [data.payload, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      } catch (err) {
        console.error('[WS] Error processing message:', err);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected from notification server');
      setIsConnected(false);
    };

    ws.onerror = (err) => {
      console.error('[WS] Connection error:', err);
    };
  };

  const disconnectWebSocket = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  };

  // Poll login status to handle dynamic logins/logouts
  useEffect(() => {
    loginCheckInterval.current = setInterval(() => {
      const logged = isLoggedIn();
      if (logged !== isUserLoggedIn) {
        setIsUserLoggedIn(logged);
      }
    }, 1000);

    return () => {
      if (loginCheckInterval.current) {
        clearInterval(loginCheckInterval.current);
      }
    };
  }, [isUserLoggedIn]);

  // Connect / Disconnect and Fetch based on login status
  useEffect(() => {
    if (isUserLoggedIn) {
      fetchNotificationList();
      connectWebSocket();
    } else {
      disconnectWebSocket();
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isUserLoggedIn]);

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err.message);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        fetchNotifications: fetchNotificationList,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
