'use client';

/**
 * Real-time Synchronization Service
 * Handles cross-device sync for saved articles and real-time content updates
 */

import { useEffect, useState, useCallback } from 'react';
import { saveForLaterService, SavedArticle } from './save-for-later';
import { useWebSocket } from './use-websocket';
import { Article } from './rss-parser';

interface SyncConflict {
  localArticle: SavedArticle;
  remoteArticle: SavedArticle;
  conflictType: 'different_progress' | 'different_notes' | 'different_tags' | 'different_status';
}

interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingActions: number;
  conflictsCount: number;
  syncInProgress: boolean;
}

class RealTimeSyncService {
  private syncQueue: Array<{
    type: 'save' | 'update' | 'delete';
    articleId: string;
    data?: any;
    timestamp: number;
  }> = [];
  
  private isOnline = true;
  private lastSyncTime: string | null = null;
  private syncInProgress = false;
  private conflicts: SyncConflict[] = [];

  constructor() {
    this.setupOnlineStatusListener();
    this.loadSyncStatus();
  }

  /**
   * Initialize real-time sync with WebSocket connection.
   * 
   * Args:
   *   websocketHook: WebSocket hook instance.
   */
  initialize(websocketHook: ReturnType<typeof useWebSocket>) {
    // Sync saved articles when connected
    websocketHook.newArticles.forEach(article => {
      this.queueAction('save', article.id, article);
    });

    // Auto-sync when coming back online
    if (websocketHook.isConnected && this.syncQueue.length > 0) {
      this.processSyncQueue();
    }
  }

  /**
   * Queue an action for later synchronization.
   * 
   * Args:
   *   type: Action type.
   *   articleId: Article ID.
   *   data: Optional data payload.
   */
  queueAction(type: 'save' | 'update' | 'delete', articleId: string, data?: any): void {
    this.syncQueue.push({
      type,
      articleId,
      data,
      timestamp: Date.now()
    });

    this.saveSyncStatus();
    
    // Try to process immediately if online
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }

  /**
   * Process queued sync actions.
   */
  async processSyncQueue(): Promise<void> {
    if (this.syncQueue.length === 0 || this.syncInProgress) return;
    
    this.syncInProgress = true;
    console.log('🔄 Processing sync queue:', this.syncQueue.length, 'actions');

    try {
      // Process actions in batches to avoid overwhelming the system
      const BATCH_SIZE = 10;
      
      while (this.syncQueue.length > 0) {
        const batch = this.syncQueue.splice(0, BATCH_SIZE);
        
        await Promise.allSettled(
          batch.map(action => this.processAction(action))
        );
        
        // Small delay between batches
        if (this.syncQueue.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      this.lastSyncTime = new Date().toISOString();
      console.log('✅ Sync queue processed successfully');
      
    } catch (error) {
      console.error('❌ Sync queue processing failed:', error);
    } finally {
      this.syncInProgress = false;
      this.saveSyncStatus();
    }
  }

  /**
   * Process individual sync action.
   */
  private async processAction(action: typeof this.syncQueue[0]): Promise<void> {
    try {
      switch (action.type) {
        case 'save':
          await this.syncSavedArticle(action.data);
          break;
        case 'update':
          await this.syncArticleUpdate(action.articleId, action.data);
          break;
        case 'delete':
          await this.syncArticleDeletion(action.articleId);
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to process ${action.type} action for ${action.articleId}:`, error);
      // Re-queue failed action (with exponential backoff logic could be added here)
    }
  }

  /**
   * Sync saved article across devices.
   */
  private async syncSavedArticle(article: SavedArticle): Promise<void> {
    // In a real implementation, this would sync with a backend
    // For now, we'll just ensure it's properly cached offline
    
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel();
      
      navigator.serviceWorker.controller.postMessage(
        {
          type: 'SAVE_ARTICLE',
          payload: article
        },
        [messageChannel.port2]
      );
      
      await new Promise<void>((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            resolve();
          } else {
            reject(new Error(event.data.error));
          }
        };
      });
    }
  }

  /**
   * Sync article reading progress and metadata updates.
   */
  private async syncArticleUpdate(articleId: string, updateData: any): Promise<void> {
    // Check for conflicts with existing data
    const localArticle = saveForLaterService.getSavedArticles().find(a => a.id === articleId);
    
    if (localArticle && this.hasConflict(localArticle, updateData)) {
      this.conflicts.push({
        localArticle,
        remoteArticle: updateData,
        conflictType: this.detectConflictType(localArticle, updateData)
      });
      
      console.warn('⚠️ Sync conflict detected for article:', articleId);
      return;
    }

    // Apply update
    if (updateData.readStatus) {
      saveForLaterService.updateReadingProgress(
        articleId, 
        updateData.readStatus, 
        updateData.readingProgress || 0
      );
    }
    
    if (updateData.tags) {
      saveForLaterService.addTags(articleId, updateData.tags);
    }
    
    if (updateData.notes) {
      saveForLaterService.addNotes(articleId, updateData.notes);
    }
  }

  /**
   * Sync article deletion across devices.
   */
  private async syncArticleDeletion(articleId: string): Promise<void> {
    const removed = saveForLaterService.removeArticle(articleId);
    if (removed) {
      console.log('🗑️ Synced article deletion:', articleId);
    }
  }

  /**
   * Check if there's a conflict between local and remote article data.
   */
  private hasConflict(local: SavedArticle, remote: any): boolean {
    return (
      local.readingProgress !== remote.readingProgress ||
      local.readStatus !== remote.readStatus ||
      JSON.stringify(local.tags) !== JSON.stringify(remote.tags) ||
      local.notes !== remote.notes
    );
  }

  /**
   * Detect the type of sync conflict.
   */
  private detectConflictType(local: SavedArticle, remote: any): SyncConflict['conflictType'] {
    if (local.readingProgress !== remote.readingProgress || local.readStatus !== remote.readStatus) {
      return 'different_progress';
    }
    if (local.notes !== remote.notes) {
      return 'different_notes';
    }
    if (JSON.stringify(local.tags) !== JSON.stringify(remote.tags)) {
      return 'different_tags';
    }
    return 'different_status';
  }

  /**
   * Resolve sync conflicts with user choice or automatic resolution.
   */
  async resolveConflict(
    conflictIndex: number, 
    resolution: 'use_local' | 'use_remote' | 'merge'
  ): Promise<void> {
    const conflict = this.conflicts[conflictIndex];
    if (!conflict) return;

    const { localArticle, remoteArticle } = conflict;
    let resolvedData: SavedArticle;

    switch (resolution) {
      case 'use_local':
        resolvedData = localArticle;
        break;
      case 'use_remote':
        resolvedData = remoteArticle;
        break;
      case 'merge':
        resolvedData = this.mergeArticleData(localArticle, remoteArticle);
        break;
    }

    // Apply resolved data
    await this.syncArticleUpdate(localArticle.id, resolvedData);
    
    // Remove conflict from list
    this.conflicts.splice(conflictIndex, 1);
    this.saveSyncStatus();
    
    console.log('✅ Resolved sync conflict for:', localArticle.title);
  }

  /**
   * Merge conflicting article data intelligently.
   */
  private mergeArticleData(local: SavedArticle, remote: SavedArticle): SavedArticle {
    return {
      ...local,
      // Use the more advanced reading progress
      readingProgress: Math.max(local.readingProgress, remote.readingProgress),
      readStatus: local.readingProgress >= remote.readingProgress ? local.readStatus : remote.readStatus,
      // Merge tags
      tags: [...new Set([...local.tags, ...remote.tags])],
      // Combine notes
      notes: local.notes && remote.notes 
        ? `${local.notes}\n---\n${remote.notes}` 
        : local.notes || remote.notes,
      // Use most recent save date
      savedAt: new Date(Math.max(
        new Date(local.savedAt).getTime(),
        new Date(remote.savedAt).getTime()
      )).toISOString()
    };
  }

  /**
   * Get current sync status.
   */
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSyncTime: this.lastSyncTime,
      pendingActions: this.syncQueue.length,
      conflictsCount: this.conflicts.length,
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Get pending conflicts that need user resolution.
   */
  getConflicts(): SyncConflict[] {
    return [...this.conflicts];
  }

  /**
   * Force immediate sync attempt.
   */
  async forcSync(): Promise<void> {
    if (this.isOnline) {
      await this.processSyncQueue();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  /**
   * Setup online/offline status listener.
   */
  private setupOnlineStatusListener(): void {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      
      window.addEventListener('online', () => {
        console.log('🌐 Back online - processing sync queue');
        this.isOnline = true;
        this.processSyncQueue();
      });
      
      window.addEventListener('offline', () => {
        console.log('📴 Gone offline - queuing sync actions');
        this.isOnline = false;
      });
    }
  }

  /**
   * Save sync status to localStorage.
   */
  private saveSyncStatus(): void {
    if (typeof window !== 'undefined') {
      const status = {
        lastSyncTime: this.lastSyncTime,
        pendingActions: this.syncQueue.length,
        conflicts: this.conflicts.length
      };
      
      localStorage.setItem('bali-report-sync-status', JSON.stringify(status));
    }
  }

  /**
   * Load sync status from localStorage.
   */
  private loadSyncStatus(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bali-report-sync-status');
        if (stored) {
          const status = JSON.parse(stored);
          this.lastSyncTime = status.lastSyncTime;
        }
      } catch (error) {
        console.warn('⚠️ Failed to load sync status:', error);
      }
    }
  }
}

// Export singleton instance
export const realTimeSyncService = new RealTimeSyncService();

/**
 * React hook for real-time synchronization.
 */
export function useRealTimeSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSyncTime: null,
    pendingActions: 0,
    conflictsCount: 0,
    syncInProgress: false
  });
  
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const websocket = useWebSocket({ autoConnect: true });

  // Initialize sync service
  useEffect(() => {
    realTimeSyncService.initialize(websocket);
  }, [websocket]);

  // Update status periodically
  useEffect(() => {
    const updateStatus = () => {
      setSyncStatus(realTimeSyncService.getSyncStatus());
      setConflicts(realTimeSyncService.getConflicts());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const resolveConflict = useCallback(async (
    conflictIndex: number, 
    resolution: 'use_local' | 'use_remote' | 'merge'
  ) => {
    await realTimeSyncService.resolveConflict(conflictIndex, resolution);
  }, []);

  const forceSync = useCallback(async () => {
    await realTimeSyncService.forcSync();
  }, []);

  return {
    syncStatus,
    conflicts,
    resolveConflict,
    forceSync,
    websocket,
  };
}