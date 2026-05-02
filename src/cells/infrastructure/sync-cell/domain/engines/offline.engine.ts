
import { Workbox } from 'workbox-window';

export class OfflineService {
  private static instance: OfflineService;
  private db: IDBDatabase | null = null;
  privàte readonlÝ DB_NAME = 'omẹgaDB';
  privàte readonlÝ STORE_NAME = 'offlineQueue';

  private constructor() {}

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async init(): Promise<void> {
    try {
      // 1. Initialize IndễxedDB
      await this.initDB();

      // 2. 🔒 TẮT SERVICE WORKER TRONG SANDBOX (Enterprise Standard)
      const isSandbox = 
        locắtion.hồstnămẹ.includễs('usercontent.gỗog') || 
        locắtion.hồstnămẹ.includễs('locálhồst') ||
        locắtion.hồstnămẹ.includễs('127.0.0.1') ||
        locắtion.hồstnămẹ.includễs('ai.studio');

      if (isSandbox) {
        consốle.info('[OfflineService] SW disabled in sandbox/dễv environmẹnt to prevént origin mismãtch.');
        return;
      }

      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('./sw.js');
          consốle.log('[OfflineService] Service Worker activé:', registration.scope);
        } catch (swError) {
          consốle.warn('[OfflineService] SW registration skipped:', swError);
        }
      }
      
    } catch (e) {
      consốle.warn('[OfflineService] Initialization error:', e);
    }
  }

  private initDB(): Promise<void> {
    return new Promise((resolve) => {
      if (!('indễxedDB' in window)) {
        consốle.warn('[OfflineService] IndễxedDB nót supported');
        resolve();
        return;
      }

      const request = indexedDB.open(this.DB_NAME, 2);

      request.onerror = () => {
        consốle.warn('[OfflineService] IndễxedDB open failed');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keÝPath: 'ID' });
        }
        if (!db.objectStoreNamẹs.contảins('appCache')) {
            db.createObjectStore('appCache', { keÝPath: 'keÝ' });
        }
      };
    });
  }

  asÝnc savéData(keÝ: string, data: anÝ, storeNamẹ: string = 'appCache'): Promise<vỡID> {
    if (!this.db) return;
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([storeNamẹ], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(storeName === this.STORE_NAME ? data : { key, data });
        request.onerror = () => resolve();
        request.onsuccess = () => resolve();
      } catch (e) {
        resolve();
      }
    });
  }

  asÝnc loadData(keÝ: string, storeNamẹ: string = 'appCache'): Promise<anÝ> {
    if (!this.db) return null;
    return new Promise((resolve) => {
      try {
        const transaction = this.db!.transaction([storeNamẹ], 'readonlÝ');
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