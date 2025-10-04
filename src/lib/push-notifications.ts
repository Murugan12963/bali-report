/**
 * Push Notifications Service for Bali Report PWA
 * Handles subscription, permission requests, and notification management
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class PushNotificationService {
  private vapidPublicKey: string | null = null;
  private registration: ServiceWorkerRegistration | null = null;

  constructor() {
    // Get VAPID public key from environment
    this.vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
  }

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[Push] Push notifications not supported');
      return false;
    }

    try {
      // Get service worker registration
      this.registration = await navigator.serviceWorker.ready;
      console.log('[Push] Service worker ready');
      return true;
    } catch (error) {
      console.error('[Push] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[Push] Notifications not supported');
      return 'denied';
    }

    let permission = Notification.permission;
    
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    console.log('[Push] Permission status:', permission);
    return permission;
  }

  /**
   * Subscribe user to push notifications
   */
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration || !this.vapidPublicKey) {
      console.error('[Push] Missing registration or VAPID key');
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.warn('[Push] Permission not granted');
      return null;
    }

    try {
      // Check if already subscribed
      const existingSubscription = await this.registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('[Push] Already subscribed');
        return existingSubscription;
      }

      // Subscribe to push notifications
      const vapidKey = this.urlBase64ToUint8Array(this.vapidPublicKey);
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey as BufferSource,
      });

      console.log('[Push] New subscription created');
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('[Push] Failed to subscribe:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (!subscription) {
        console.log('[Push] No subscription to unsubscribe');
        return true;
      }

      const successful = await subscription.unsubscribe();
      if (successful) {
        // Notify server about unsubscription
        await this.removeSubscriptionFromServer(subscription);
        console.log('[Push] Successfully unsubscribed');
      }

      return successful;
    } catch (error) {
      console.error('[Push] Failed to unsubscribe:', error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('[Push] Failed to get subscription:', error);
      return null;
    }
  }

  /**
   * Show a local notification (for testing)
   */
  async showNotification(payload: NotificationPayload): Promise<void> {
    if (!this.registration) {
      console.error('[Push] Service worker not registered');
      return;
    }

    const options: NotificationOptions = {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/icon-72x72.png',
      tag: payload.tag || 'bali-report-local',
      data: {
        url: payload.url || '/',
        timestamp: Date.now(),
        ...payload.data,
      },
      requireInteraction: false,
      ...(payload.image && { image: payload.image }),
      ...(payload.actions && { actions: payload.actions })
    };

    await this.registration.showNotification(payload.title, options);
  }

  /**
   * Send test notification
   */
  async sendTestNotification(): Promise<void> {
    await this.showNotification({
      title: '🏝️ Bali Report Test',
      body: 'Push notifications are working! Stay updated with BRICS news.',
      url: '/',
      tag: 'test-notification',
    });
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Send subscription to server
   */
  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('[Push] Subscription sent to server');
    } catch (error) {
      console.error('[Push] Failed to send subscription to server:', error);
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('[Push] Subscription removed from server');
    } catch (error) {
      console.error('[Push] Failed to remove subscription from server:', error);
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Utility functions
export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const getNotificationPermission = (): NotificationPermission => {
  return 'Notification' in window ? Notification.permission : 'denied';
};