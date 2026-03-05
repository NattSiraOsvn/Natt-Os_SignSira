// ============================================================================
// src/cells/kernel/security-cell/domain/services/threat-detection.engine.ts
// Migrated from: services/threat-detection-service.ts
// Fixed ghost imports:
//   notificationservice    → @/services/notification-service
//   blockchainservice      → @/services/sharding-service
//   quantumbufferservice   → @/services/quantum-buffer-service
//   calibration/CalibrationEngine → cells/kernel/config-cell/domain/services/calibration.engine
// Migrated by Băng — 2026-03-06
// ============================================================================

import { PersonaID, AlertLevel, InputMetrics, InputPersona } from '@/types';
import { NotifyBus } from '@/services/notification-service';
import { ShardingService } from '@/services/sharding-service';
import { QuantumBuffer } from '@/services/quantum-buffer-service';
import { Calibration } from '@/cells/kernel/config-cell/domain/services/calibration.engine';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThreatLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'STAGING';
export type ThreatType =
  | 'DOS_ATTACK'
  | 'MALICIOUS_FILE'
  | 'SPAM_BEHAVIOR'
  | 'ANOMALY'
  | 'BOT_DETECTED'
  | 'HONEYPOT_TRIGGER';

export interface SecurityThreat {
  id: string;
  type: ThreatType;
  level: ThreatLevel;
  details: string;
  timestamp: number;
  hash?: string;
  status: 'DETECTED' | 'BLOCKED' | 'MITIGATED' | 'LOGGED_TO_SERVER' | 'STAGED';
  sessionId: string;
  clientIP: string;
  userAgent: string;
}

export interface SecurityConfig {
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'ADAPTIVE';
  autoBlock: boolean;
  siemEndpoint?: string;
}

export interface SystemHealth {
  cpuLoad: number;
  memoryUsage: number;
  activeConnections: number;
  integrityStatus: 'SECURE' | 'COMPROMISED' | 'CHECKING';
  cpmMetrics?: InputMetrics;
}

// ─── Behavioral Tracker ───────────────────────────────────────────────────────

class BehavioralTracker {
  private keyStamps: number[] = [];
  private clickStamps: number[] = [];
  private readonly WINDOW_MS = 60_000;

  trackKey(): void { this.keyStamps.push(Date.now()); this.clean(); }
  trackClick(): void { this.clickStamps.push(Date.now()); this.clean(); }

  private clean(): void {
    const now = Date.now();
    this.keyStamps = this.keyStamps.filter(t => now - t < this.WINDOW_MS);
    this.clickStamps = this.clickStamps.filter(t => now - t < this.WINDOW_MS);
  }

  getMetrics(): InputMetrics {
    const intensity = (this.keyStamps.length / 300) + (this.clickStamps.length / 60);
    return {
      currentCPM: this.keyStamps.length,
      keystrokes: this.keyStamps.length,
      clicks: this.clickStamps.length,
      intensity: Math.min(1.0, intensity)
    };
  }
}

// ─── Threat Detection Engine ──────────────────────────────────────────────────

class ThreatDetectionEngine {
  private static instance: ThreatDetectionEngine;
  private tracker = new BehavioralTracker();
  private listeners: ((threat: SecurityThreat) => void)[] = [];
  private blockedEntities: Set<string> = new Set();
  private sessionId = `SESS-${Date.now()}`;
  private clientIP = '127.0.0.1';

  private config: SecurityConfig = {
    sensitivity: 'ADAPTIVE',
    autoBlock: true,
    siemEndpoint: '/api/v1/security/log'
  };

  private healthMetrics: SystemHealth = {
    cpuLoad: 12,
    memoryUsage: 34,
    activeConnections: 1,
    integrityStatus: 'SECURE'
  };

  private constructor() { this.startHeartbeat(); }

  static getInstance(): ThreatDetectionEngine {
    if (!ThreatDetectionEngine.instance) {
      ThreatDetectionEngine.instance = new ThreatDetectionEngine();
    }
    return ThreatDetectionEngine.instance;
  }

  private startHeartbeat(): void {
    setInterval(() => {
      const metrics = this.tracker.getMetrics();
      this.healthMetrics = {
        ...this.healthMetrics,
        cpuLoad: Math.min(100, Math.max(5, this.healthMetrics.cpuLoad + (Math.random() - 0.5) * 5)),
        cpmMetrics: metrics
      };

      if (this.config.sensitivity === 'ADAPTIVE') {
        const threshold = Calibration.calculateAdaptiveThreshold('MASTER_NATT', metrics.intensity);
        if (metrics.currentCPM > threshold) {
          this.triggerStagingFlow(
            `High Activity: ${metrics.currentCPM} CPM (threshold: ${threshold.toFixed(0)})`
          );
        }
      }
    }, 2000);
  }

  updateConfig(newConfig: Partial<SecurityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  trackUserActivity(type: string): void {
    if (type === 'keydown') this.tracker.trackKey();
    if (type === 'click') this.tracker.trackClick();
  }

  trackKeystroke(): void { this.tracker.trackKey(); }

  private triggerStagingFlow(reason: string): void {
    QuantumBuffer.enqueue('TRAFFIC_STAGING', { reason }, 1);

    const threat: SecurityThreat = {
      id: `STAGE-${Date.now()}`,
      type: 'ANOMALY',
      level: 'STAGING',
      details: reason,
      timestamp: Date.now(),
      status: 'STAGED',
      sessionId: this.sessionId,
      clientIP: this.clientIP,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SERVER'
    };

    this.listeners.forEach(l => l(threat));
  }

  triggerThreat(type: ThreatType, level: ThreatLevel, details: string): void {
    const threat: SecurityThreat = {
      id: `THREAT-${Date.now()}`,
      type, level, details,
      timestamp: Date.now(),
      status: 'DETECTED',
      sessionId: this.sessionId,
      clientIP: this.clientIP,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SERVER'
    };

    if (this.config.autoBlock && (level === 'CRITICAL' || level === 'HIGH')) {
      this.blockedEntities.add(this.clientIP);
      threat.status = 'BLOCKED';
    }

    NotifyBus.push({
      type: 'RISK',
      title: `SECURITY ALERT: ${type}`,
      content: details,
      persona: PersonaID.KRIS
    });

    this.listeners.forEach(l => l(threat));
  }

  subscribe(listener: (threat: SecurityThreat) => void): () => void {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  getHealth(): SystemHealth { return this.healthMetrics; }
  getConfig(): SecurityConfig { return this.config; }
  getBlockedEntities(): string[] { return Array.from(this.blockedEntities); }

  async scanFile(_file: File): Promise<boolean> { return true; }
  checkInputContent(_content: string): void {}
}

export const ThreatDetection = ThreatDetectionEngine.getInstance();
export default ThreatDetection;
