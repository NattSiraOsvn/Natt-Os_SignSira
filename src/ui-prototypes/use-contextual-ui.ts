// @ts-nocheck
 
import { useState, useEffect } from 'react';

export type UIMode = 'night' | 'morning' | 'work' | 'evening' | 'fast' | 'precise' | 'ai' | 'heavy';

/**
 * 🧠 CONTEXTUAL UI ADAPTER
 * Đồng bộ diện mạo và hành vi theo ngữ cảnh sử dụng.
 */
export const useContextualUI = (currentTime: Date, intensity: number, clusterRole?: string) => {
  const [uiMode, setUiMode] = useState<UIMode>('work');

  useEffect(() => {
    const hour = currentTime.getHours();
    let mode: UIMode = 'work';

    // 1. Time-based Logic
    if (hour >= 22 || hour < 5) mode = 'night';
    else if (hour >= 5 && hour < 9) mode = 'morning';
    else if (hour >= 18) mode = 'evening';

    // 2. Behavioral Overrides
    if (intensity > 0.8) mode = 'fast';
    else if (intensity < 0.05) mode = 'precise';

    // 3. Cluster Context Overrides
    if (clusterRole === 'ai') mode = 'ai';
    else if (clusterRole === 'heavy') mode = 'heavy';

    setUiMode(mode);
  }, [currentTime, intensity, clusterRole]);

  return uiMode;
};
