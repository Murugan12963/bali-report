/**
 * WebSocket Server for Real-time Updates
 * Handles live content updates, notifications, and real-time synchronization
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { Article } from './rss-parser';

export interface SocketData {
  userId?: string;
  sessionId: string;
  userPreferences?: {
    topics: string[];
    location: string;
  };
}

export interface ServerToClientEvents {
  'new-articles': (articles: Article[]) => void;
  'article-update': (article: Article) => void;
  'sync-request': () => void;
  'content-refresh': (category?: string) => void;
  'notification': (notification: {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
  }) => void;
}

export interface ClientToServerEvents {
  'join-room': (room: string) => void;
  'leave-room': (room: string) => void;
  'subscribe-category': (category: 'BRICS' | 'Indonesia' | 'Bali') => void;
  'unsubscribe-category': (category: 'BRICS' | 'Indonesia' | 'Bali') => void;
  'sync-saved-articles': (articles: any[]) => void;
  'heartbeat': () => void;
}

class WebSocketServer {
  private io: SocketIOServer | null = null;
  private httpServer: HTTPServer | null = null;
  private connectedClients = new Map<string, Socket>();
  private articleUpdateQueue: Article[] = [];
  private readonly UPDATE_INTERVAL = 30000; // 30 seconds
  private updateTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startPeriodicUpdates();
  }

  /**
   * Initialize WebSocket server with HTTP server.
   * 
   * Args:
   *   server (HTTPServer): HTTP server instance.
   * 
   * Returns:
   *   SocketIOServer: Configured Socket.IO server.
   */
  initialize(server: HTTPServer): SocketIOServer {
    this.httpServer = server;
    
    this.io = new SocketIOServer<
      ClientToServerEvents,
      ServerToClientEvents,
      Record<string, never>,
      SocketData
    >(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? ['https://bali.report', 'https://www.bali.report']
          : ['http://localhost:3000', 'http://127.0.0.1:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupEventHandlers();
    console.log('🔌 WebSocket server initialized');
    
    return this.io;
  }

  /**
   * Set up Socket.IO event handlers.
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const sessionId = this.generateSessionId();
      socket.data.sessionId = sessionId;
      
      this.connectedClients.set(socket.id, socket);
      console.log(`🔗 Client connected: ${socket.id} (Session: ${sessionId})`);

      // Send welcome message
      socket.emit('notification', {
        id: `welcome-${sessionId}`,
        type: 'info',
        title: '🌺 Welcome to Bali Report',
        message: 'Real-time updates are now active. You\'ll receive live news as it happens!',
        timestamp: new Date().toISOString(),
      });

      // Handle room joining (for category subscriptions)
      socket.on('join-room', (room: string) => {
        socket.join(room);
        console.log(`📡 Client ${socket.id} joined room: ${room}`);
        
        socket.emit('notification', {
          id: `joined-${room}-${Date.now()}`,
          type: 'success',
          title: 'Subscribed',
          message: `You're now receiving live updates for ${room}`,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle room leaving
      socket.on('leave-room', (room: string) => {
        socket.leave(room);
        console.log(`📡 Client ${socket.id} left room: ${room}`);
      });

      // Handle category subscriptions
      socket.on('subscribe-category', (category) => {
        socket.join(`category-${category}`);
        console.log(`📂 Client ${socket.id} subscribed to category: ${category}`);
      });

      socket.on('unsubscribe-category', (category) => {
        socket.leave(`category-${category}`);
        console.log(`📂 Client ${socket.id} unsubscribed from category: ${category}`);
      });

      // Handle saved articles sync
      socket.on('sync-saved-articles', (articles) => {
        // Broadcast to other sessions of the same user (if authenticated)
        // For now, we'll just acknowledge the sync
        socket.emit('notification', {
          id: `sync-${Date.now()}`,
          type: 'success',
          title: 'Sync Complete',
          message: `${articles.length} articles synchronized`,
          timestamp: new Date().toISOString(),
        });
      });

      // Handle heartbeat for connection health
      socket.on('heartbeat', () => {
        socket.emit('notification', {
          id: `heartbeat-${Date.now()}`,
          type: 'info',
          title: 'Connection Active',
          message: 'Real-time connection is healthy',
          timestamp: new Date().toISOString(),
        });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.connectedClients.delete(socket.id);
        console.log(`🔌 Client disconnected: ${socket.id}, reason: ${reason}`);
      });

      // Handle connection errors
      socket.on('error', (error) => {
        console.error(`❌ Socket error for ${socket.id}:`, error);
      });
    });
  }

  /**
   * Broadcast new articles to subscribed clients.
   * 
   * Args:
   *   articles (Article[]): New articles to broadcast.
   *   category (string): Category to broadcast to.
   */
  broadcastNewArticles(articles: Article[], category?: string): void {
    if (!this.io) return;

    const room = category ? `category-${category}` : undefined;
    const target = room ? this.io.to(room) : this.io;

    target.emit('new-articles', articles);
    
    // Send notification about new content
    target.emit('notification', {
      id: `new-articles-${Date.now()}`,
      type: 'info',
      title: '📰 Fresh News Available',
      message: `${articles.length} new article${articles.length > 1 ? 's' : ''} ${category ? `in ${category}` : 'available'}`,
      timestamp: new Date().toISOString(),
    });

    console.log(`📡 Broadcasted ${articles.length} articles to ${room || 'all clients'}`);
  }

  /**
   * Broadcast article update to all clients.
   * 
   * Args:
   *   article (Article): Updated article.
   */
  broadcastArticleUpdate(article: Article): void {
    if (!this.io) return;

    this.io.emit('article-update', article);
    console.log(`📄 Broadcasted article update: ${article.title}`);
  }

  /**
   * Request content refresh from all clients.
   * 
   * Args:
   *   category (string): Optional category to refresh.
   */
  requestContentRefresh(category?: string): void {
    if (!this.io) return;

    const room = category ? `category-${category}` : undefined;
    const target = room ? this.io.to(room) : this.io;

    target.emit('content-refresh', category);
    console.log(`🔄 Requested content refresh for ${category || 'all categories'}`);
  }

  /**
   * Get connected clients count.
   * 
   * Returns:
   *   number: Number of connected clients.
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get server statistics.
   * 
   * Returns:
   *   object: Server statistics.
   */
  getStats(): {
    connectedClients: number;
    totalRooms: number;
    uptime: number;
    lastUpdate: string;
  } {
    const rooms = this.io?.sockets.adapter.rooms.size || 0;
    const uptime = process.uptime();
    
    return {
      connectedClients: this.getConnectedClientsCount(),
      totalRooms: rooms,
      uptime: Math.floor(uptime),
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Add article to update queue for batch processing.
   * 
   * Args:
   *   article (Article): Article to queue for update.
   */
  queueArticleUpdate(article: Article): void {
    this.articleUpdateQueue.push(article);
    console.log(`📝 Queued article update: ${article.title} (Queue: ${this.articleUpdateQueue.length})`);
  }

  /**
   * Process queued article updates in batches.
   */
  private processQueuedUpdates(): void {
    if (this.articleUpdateQueue.length === 0) return;

    const updates = [...this.articleUpdateQueue];
    this.articleUpdateQueue = [];

    // Group by category for efficient broadcasting
    const categorizedUpdates: Record<string, Article[]> = {};
    updates.forEach(article => {
      const category = article.category || 'general';
      if (!categorizedUpdates[category]) {
        categorizedUpdates[category] = [];
      }
      categorizedUpdates[category].push(article);
    });

    // Broadcast updates by category
    Object.entries(categorizedUpdates).forEach(([category, articles]) => {
      this.broadcastNewArticles(articles, category);
    });

    console.log(`📡 Processed ${updates.length} queued updates across ${Object.keys(categorizedUpdates).length} categories`);
  }

  /**
   * Start periodic update processing.
   */
  private startPeriodicUpdates(): void {
    this.updateTimer = setInterval(() => {
      this.processQueuedUpdates();
    }, this.UPDATE_INTERVAL);

    console.log(`⏰ Started periodic updates every ${this.UPDATE_INTERVAL / 1000}s`);
  }

  /**
   * Stop periodic update processing.
   */
  stopPeriodicUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
      console.log('⏰ Stopped periodic updates');
    }
  }

  /**
   * Generate unique session ID.
   * 
   * Returns:
   *   string: Unique session identifier.
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Cleanup resources and close server.
   */
  async close(): Promise<void> {
    this.stopPeriodicUpdates();
    
    if (this.io) {
      await new Promise<void>((resolve) => {
        this.io!.close(() => {
          console.log('🔌 WebSocket server closed');
          resolve();
        });
      });
    }
    
    this.connectedClients.clear();
  }
}

// Export singleton instance
export const websocketServer = new WebSocketServer();

// Export class for custom instances
export { WebSocketServer };