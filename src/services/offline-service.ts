// STUB — OfflineService
export const OfflineService = {
  saveData: (key: string, data: unknown): void => {
    try { localStorage?.setItem(key, JSON.stringify(data)); } catch {}
  },
  getData: (key: string): unknown => {
    try { const v = localStorage?.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  isOnline: (): boolean => typeof navigator !== 'undefined' ? navigator.onLine : true,
};
export default OfflineService;
