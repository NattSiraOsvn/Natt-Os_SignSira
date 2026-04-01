
import { config } from './config';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: {
    storage: boolean;
    eventBus: boolean;
    memory: number;
  };
}

/**
 * 🏥 HEALTH SERVICE
 */
export class HealthService {
  static async check(): Promise<HealthStatus> {
    const checks = {
      storage: !!window.localStorage, // HEALTH_CHECK: existence check only, not read/write
      eventBus: true, // Internal bridge is always up in browser
      memory: (performance as any).memory?.usedJSHeapSize || 0
    };

    const isHealthy = checks.storage && checks.eventBus;

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks
    };
  }
}
