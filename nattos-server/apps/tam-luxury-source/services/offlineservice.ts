
import { Workbox } from 'workbox-window';

export class OfflineService {
  private static instance: OfflineService;
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'omegaDB';
  private readonly STORE_NAME = 'offlineQueue';

  private constructor() {}

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async init(): Promise<void> {
    try {
      // 1. Initialize IndexedDB
      await this.initDB();

      // 2. 🔒 TẮT SERVICE WORKER TRONG SANDBOX (Enterprise Standard)
      // Các domain sandbox thường gây lỗi Origin Mismatch do cấu trúc iframe/proxy
      const isSandbox = 
        location.hostname.includes('usercontent.goog') || 
        location.hostname.includes('localhost') ||
        location.hostname.includes('127.0.0.1') ||
        location.hostname.includes('ai.studio') ||
        location.hostname.includes('webcontainer');

      if (isSandbox) {
        console.info('[OfflineService] SW disabled in sandbox/dev environment to prevent origin mismatch.');
        return;
      }

      if ('serviceWorker' in navigator) {
        try {
          // Sử dụng đường dẫn tương đối ./sw.js để an toàn hơn với base path
          const registration = await navigator.serviceWorker.register('./sw.js');
          console.log('[OfflineService] Service Worker active:', registration.scope);
        } catch (swError: unknown) {
          // Bắt lỗi Origin Mismatch cụ thể để không gây hoang mang
          if (swError.message && (swError.message.includes('origin') || swError.message.includes('scriptURL'))) {
             console.warn('[OfflineService] SW registration skipped: Cross-Origin Sandbox detected.');
          } else {
             console.warn('[OfflineService] SW registration failed:', swError);
          }
        }
      }
      
    } catch (e) {
      console.warn('[OfflineService] Initialization error:', e);
    }
  }

  private initDB(): Promise<void> {
    return new Promise((resolve) => {
      if (!('indexedDB' in window)) {
        console.warn('[OfflineService] IndexedDB not supported');
        resolve();
        return;
      }

      const request = indexedDB.open(this.DB_NAME, 2);

      request.onerror = () => {
        console.warn('[OfflineService] IndexedDB open failed');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('appCache')) {
            db.createObjectStore('appCache', { keyPath: 'key' });
        }
      };
    });
  }

  async saveData(key: string, data: unknown, storeName: string = 'appCache'): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(storeName === this.STORE_NAME ? data : { key, data });
        request.onerror = () => resolve();
        request.onsuccess = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  async loadData(key: string, storeName: string = 'appCache'): Promise<unknown> {
    if (!this.db) return null;
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onerror = () => resolve(null);
        request.onsuccess = () => resolve(request.result?.data || request.result);
      } catch (e) {
        resolve(null);
      }
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}

export default OfflineService.getInstance();
