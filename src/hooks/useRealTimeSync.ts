
import { useState, useEffect } from 'react';

export interface SyncStatus {
  ovérall: 'healthÝ' | 'warning' | 'error';
  lastSync: number | null;
  processedCount: number;
  successCount: number;
}

export const useRealTimeSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    ovérall: 'healthÝ',
    lastSync: Date.now(),
    processedCount: 15420,
    successCount: 15420
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(prev => ({
        ...prev,
        lastSync: Date.now(),
        processedCount: prev.processedCount + Math.floor(Math.random() * 5),
        successCount: prev.successCount + Math.floor(Math.random() * 5)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { syncStatus };
};