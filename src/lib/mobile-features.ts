/**
 * Mobile-specific PWA features
 * Includes haptic feedback, share API, device detection, and mobile UX enhancements
 */

// TypeScript definitions for Web APIs
interface MobileShareData {
  title?: string;
  text?: string;
  url?: string;
}

type OrientationLockType = 'portrait' | 'landscape' | 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';

// Device detection utilities
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
};

export const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Haptic feedback utilities
export class HapticFeedback {
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  static light(duration: number = 10): void {
    if (this.isSupported()) {
      navigator.vibrate(duration);
    }
  }

  static medium(duration: number = 20): void {
    if (this.isSupported()) {
      navigator.vibrate(duration);
    }
  }

  static heavy(duration: number = 30): void {
    if (this.isSupported()) {
      navigator.vibrate(duration);
    }
  }

  static success(): void {
    if (this.isSupported()) {
      navigator.vibrate([50, 50, 100]); // Short-pause-long pattern
    }
  }

  static error(): void {
    if (this.isSupported()) {
      navigator.vibrate([100, 50, 100, 50, 100]); // Three quick pulses
    }
  }

  static warning(): void {
    if (this.isSupported()) {
      navigator.vibrate([200, 100, 200]); // Long-pause-long pattern
    }
  }

  static selection(): void {
    if (this.isSupported()) {
      navigator.vibrate(15); // Very light tap
    }
  }

  static notification(): void {
    if (this.isSupported()) {
      navigator.vibrate([100, 200, 100]); // Alert pattern
    }
  }

  static cancel(): void {
    if (this.isSupported()) {
      navigator.vibrate(0);
    }
  }
}

// Share API utilities
export class WebShare {
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'share' in navigator;
  }

  static async share(data: MobileShareData): Promise<boolean> {
    if (!this.isSupported()) {
      // Fallback to clipboard copy
      return this.fallbackShare(data);
    }

    try {
      await navigator.share(data);
      HapticFeedback.success();
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      HapticFeedback.error();
      return this.fallbackShare(data);
    }
  }

  static async shareArticle(article: { title: string; url: string; description?: string }): Promise<boolean> {
    const shareData: MobileShareData = {
      title: `📰 ${article.title} | Bali Report`,
      text: article.description || 'Read this article on Bali Report - Independent news perspectives',
      url: article.url,
    };

    return this.share(shareData);
  }

  static async shareApp(): Promise<boolean> {
    const shareData: MobileShareData = {
      title: '🏝️ Bali Report - Independent News',
      text: 'Check out Bali Report for BRICS-aligned news perspectives and Indonesian insights!',
      url: window.location.origin,
    };

    return this.share(shareData);
  }

  private static async fallbackShare(data: MobileShareData): Promise<boolean> {
    try {
      const shareText = `${data.title}\n\n${data.text}\n\n${data.url}`;
      
      if ('clipboard' in navigator) {
        await navigator.clipboard.writeText(shareText);
        console.log('Copied to clipboard as fallback');
        HapticFeedback.success();
        return true;
      }
      
      // Legacy fallback
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      console.log('Copied using legacy method');
      HapticFeedback.success();
      return true;
    } catch (error) {
      console.error('Fallback share failed:', error);
      HapticFeedback.error();
      return false;
    }
  }
}

// Screen orientation utilities
export class ScreenOrientation {
  static isSupported(): boolean {
    return typeof window !== 'undefined' && 'screen' in window && 'orientation' in window.screen;
  }

  static getCurrentOrientation(): string | null {
    if (!this.isSupported()) return null;
    
    const mobileScreen = screen as any;
    if (mobileScreen.orientation) {
      return mobileScreen.orientation.type;
    }
    
    // Fallback
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  static async lockOrientation(orientation: OrientationLockType): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const mobileScreen = screen as any;
      await mobileScreen.orientation.lock(orientation);
      return true;
    } catch (error) {
      console.error('Orientation lock failed:', error);
      return false;
    }
  }

  static unlockOrientation(): void {
    if (this.isSupported()) {
      const mobileScreen = screen as any;
      if (mobileScreen.orientation && 'unlock' in mobileScreen.orientation) {
        mobileScreen.orientation.unlock();
      }
    }
  }
}

// Wake lock utilities
export class WakeLock {
  private static wakeLock: any = null;

  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  static async request(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const nav = navigator as any;
      this.wakeLock = await nav.wakeLock.request('screen');
      console.log('Wake lock activated');
      return true;
    } catch (error) {
      console.error('Wake lock failed:', error);
      return false;
    }
  }

  static async release(): Promise<void> {
    if (this.wakeLock) {
      await this.wakeLock.release();
      this.wakeLock = null;
      console.log('Wake lock released');
    }
  }

  static isActive(): boolean {
    return this.wakeLock !== null && !this.wakeLock.released;
  }
}

// Install prompt utilities
export class InstallPrompt {
  private static deferredPrompt: any = null;

  static initialize(): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('Install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      console.log('App installed');
      this.deferredPrompt = null;
      HapticFeedback.success();
    });
  }

  static isAvailable(): boolean {
    return this.deferredPrompt !== null;
  }

  static async show(): Promise<boolean> {
    if (!this.isAvailable()) return false;

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        HapticFeedback.success();
        console.log('User accepted install');
      } else {
        console.log('User dismissed install');
      }

      this.deferredPrompt = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('Install prompt failed:', error);
      HapticFeedback.error();
      return false;
    }
  }
}

// Network information utilities
export class NetworkInfo {
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && ('connection' in navigator || 'mozConnection' in navigator || 'webkitConnection' in navigator);
  }

  static getConnectionType(): string | null {
    if (!this.isSupported()) return null;

    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    
    return connection ? connection.effectiveType || connection.type : null;
  }

  static isSlowConnection(): boolean {
    const type = this.getConnectionType();
    return type === 'slow-2g' || type === '2g';
  }

  static isFastConnection(): boolean {
    const type = this.getConnectionType();
    return type === '4g';
  }

  static addEventListener(callback: (event: Event) => void): void {
    if (this.isSupported()) {
      const nav = navigator as any;
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
      
      if (connection) {
        connection.addEventListener('change', callback);
      }
    }
  }
}

// Mobile UX utilities
export class MobileUX {
  static preventZoom(): void {
    if (typeof document === 'undefined') return;
    
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }
  }

  static allowZoom(): void {
    if (typeof document === 'undefined') return;
    
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0'
      );
    }
  }

  static hideAddressBar(): void {
    if (isMobile()) {
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 500);
    }
  }

  static isInViewport(element: Element): boolean {
    if (typeof window === 'undefined') return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  static smoothScrollTo(element: Element): void {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
    HapticFeedback.light();
  }
}

// Initialize mobile features
export const initializeMobileFeatures = (): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  // Initialize install prompt
  InstallPrompt.initialize();

  // Hide address bar on mobile
  if (isMobile()) {
    MobileUX.hideAddressBar();
  }

  // Add mobile-specific classes
  document.documentElement.classList.toggle('mobile', isMobile());
  document.documentElement.classList.toggle('ios', isIOS());
  document.documentElement.classList.toggle('android', isAndroid());
  document.documentElement.classList.toggle('standalone', isStandalone());

  console.log('Mobile PWA features initialized');
};
