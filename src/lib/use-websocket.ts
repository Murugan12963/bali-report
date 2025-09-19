'use client';

/**
 * WebSocket Client Hook for Real-time Updates
 * React hook for managing Socket.IO connections and real-time features
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Article } from './rss-parser';
import { ServerToClientEvents, ClientToServerEvents } from './websocket-server';

interface WebSocketNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
}

interface UseWebSocketOptions {
  autoConnect?: boolean;
  categories?: ('BRICS' | 'Indonesia' | 'Bali')[];
}

interface UseWebSocketReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Data
  newArticles: Article[];
  notifications: WebSocketNotification[];
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  subscribeToCategory: (category: 'BRICS' | 'Indonesia' | 'Bali') => void;
  unsubscribeFromCategory: (category: 'BRICS' | 'Indonesia' | 'Bali') => void;
  syncSavedArticles: (articles: any[]) => void;
  sendHeartbeat: () => void;
  clearNotifications: () => void;
  dismissNotification: (id: string) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const { autoConnect = true, categories = [] } = options;
  
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [newArticles, setNewArticles] = useState<Article[]>([]);
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  
  // Get WebSocket URL based on environment
  const getSocketUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    
    if (process.env.NODE_ENV === 'production') {
      return 'https://bali.report';
    }
    
    return 'http://localhost:3000';
  }, []);

  // Connect to WebSocket server
  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;
    
    setIsConnecting(true);
    setConnectionError(null);
    
    const socketUrl = getSocketUrl();
    if (!socketUrl) {
      setConnectionError('Invalid socket URL');
      setIsConnecting(false);
      return;
    }
    
    console.log('🔌 Connecting to WebSocket:', socketUrl);
    
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(socketUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      retries: 3,
    });
    
    socketRef.current = socket;
    
    // Connection event handlers
    socket.on('connect', () => {
      console.log('🔗 Connected to WebSocket server');
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      
      // Auto-subscribe to specified categories
      categories.forEach(category => {
        socket.emit('subscribe-category', category);
      });
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from WebSocket server:', reason);
      setIsConnected(false);
      setIsConnecting(false);
      
      if (reason !== 'io client disconnect') {
        setConnectionError(`Disconnected: ${reason}`);
      }
    });
    
    socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      setConnectionError(error.message);
      setIsConnecting(false);
    });
    
    // Data event handlers
    socket.on('new-articles', (articles: Article[]) => {
      console.log('📰 Received new articles:', articles.length);
      setNewArticles(prev => {
        // Merge new articles, avoiding duplicates
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNew = articles.filter(a => !existingIds.has(a.id));
        return [...prev, ...uniqueNew];
      });
    });
    
    socket.on('article-update', (article: Article) => {
      console.log('📄 Received article update:', article.title);
      setNewArticles(prev => {
        const index = prev.findIndex(a => a.id === article.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = article;
          return updated;
        }
        return [...prev, article];
      });
    });
    
    socket.on('notification', (notification: WebSocketNotification) => {
      console.log('🔔 Received notification:', notification.title);
      setNotifications(prev => {
        // Keep only the last 10 notifications to prevent memory issues
        const updated = [notification, ...prev].slice(0, 10);
        return updated;
      });
      
      // Auto-dismiss info notifications after 5 seconds
      if (notification.type === 'info') {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    });
    
    socket.on('content-refresh', (category) => {
      console.log('🔄 Content refresh requested for:', category || 'all');
      // Trigger a page refresh or re-fetch data
      if (typeof window !== 'undefined') {
        // You can dispatch a custom event here for components to listen to
        window.dispatchEvent(new CustomEvent('websocket-content-refresh', {
          detail: { category }
        }));
      }
    });
    
    socket.on('sync-request', () => {
      console.log('🔄 Sync request received');
      // Trigger sync of saved articles or other data
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('websocket-sync-request'));
      }
    });
    
  }, [getSocketUrl, categories]);

  // Disconnect from WebSocket server
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting from WebSocket server');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setIsConnecting(false);
    }
  }, []);

  // Subscribe to category updates
  const subscribeToCategory = useCallback((category: 'BRICS' | 'Indonesia' | 'Bali') => {
    if (socketRef.current?.connected) {
      console.log('📂 Subscribing to category:', category);
      socketRef.current.emit('subscribe-category', category);
    }
  }, []);

  // Unsubscribe from category updates
  const unsubscribeFromCategory = useCallback((category: 'BRICS' | 'Indonesia' | 'Bali') => {
    if (socketRef.current?.connected) {
      console.log('📂 Unsubscribing from category:', category);
      socketRef.current.emit('unsubscribe-category', category);
    }
  }, []);

  // Sync saved articles with server
  const syncSavedArticles = useCallback((articles: any[]) => {
    if (socketRef.current?.connected) {
      console.log('🔄 Syncing saved articles:', articles.length);
      socketRef.current.emit('sync-saved-articles', articles);
    }
  }, []);

  // Send heartbeat to server
  const sendHeartbeat = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log('💓 Sending heartbeat');
      socketRef.current.emit('heartbeat');
    }
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Dismiss specific notification
  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && typeof window !== 'undefined') {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Set up periodic heartbeat
  useEffect(() => {
    if (!isConnected) return;
    
    const heartbeatInterval = setInterval(() => {
      sendHeartbeat();
    }, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [isConnected, sendHeartbeat]);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Data
    newArticles,
    notifications,
    
    // Actions
    connect,
    disconnect,
    subscribeToCategory,
    unsubscribeFromCategory,
    syncSavedArticles,
    sendHeartbeat,
    clearNotifications,
    dismissNotification,
  };
}

// Hook for listening to WebSocket events in components
export function useWebSocketEvents() {
  const [contentRefreshRequested, setContentRefreshRequested] = useState<{ category?: string } | null>(null);
  const [syncRequested, setSyncRequested] = useState<number>(0);

  useEffect(() => {
    const handleContentRefresh = (event: CustomEvent) => {
      setContentRefreshRequested(event.detail);
      // Auto-clear after handling
      setTimeout(() => setContentRefreshRequested(null), 1000);
    };

    const handleSyncRequest = () => {
      setSyncRequested(prev => prev + 1);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('websocket-content-refresh', handleContentRefresh as EventListener);
      window.addEventListener('websocket-sync-request', handleSyncRequest);

      return () => {
        window.removeEventListener('websocket-content-refresh', handleContentRefresh as EventListener);
        window.removeEventListener('websocket-sync-request', handleSyncRequest);
      };
    }
  }, []);

  return {
    contentRefreshRequested,
    syncRequested,
  };
}