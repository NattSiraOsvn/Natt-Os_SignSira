export interface QueueItem { id: string; type: string; payload: any; priority: number; timestamp: number; retryCount: number; }
export interface QueueStats { size: number; processed: number; failed: number; avgLatency: number; }
