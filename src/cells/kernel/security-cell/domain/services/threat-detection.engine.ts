import { EventBus } from '../../../../../core/events/event-bus';
// ── FILE 6 ──────────────────────────────────────────────────
// threat-detection.engine.ts
// Phát hiện mối đe dọa: brute force, session hijack, anomaly login
// Path: src/cells/kernel/security-cell/domain/services/

export interface ThreatSignal {
  sourceIp:     string;
  employeeId?:  string;
  eventType:    'login_fail' | 'login_ok' | 'access_denied' | 'anomaly';
  userAgent?:   string;
  timestamp:    number;
}

export interface ThreatReport {
  sourceIp:    string;
  level:       'clean' | 'suspicious' | 'threat';
  reasons:     string[];
  confidence:  number;
  blockRecommended: boolean;
}

export class ThreatDetectionEngine {
  private failCounts: Map<string, number[]> = new Map();  // ip → timestamps

  evaluate(signals: ThreatSignal[]): ThreatReport[] {
    const byIp = new Map<string, ThreatSignal[]>();
    for (const s of signals) {
      if (!byIp.has(s.sourceIp)) byIp.set(s.sourceIp, []);
      byIp.get(s.sourceIp)!.push(s);
    }

    const reports: ThreatReport[] = [];
    for (const [ip, ipSignals] of byIp) {
      const reasons: string[] = [];
      let riskScore = 0;

      const fails = ipSignals.filter(s => s.eventType === 'login_fail');
      if (fails.length >= 5) {
        reasons.push(`${fails.length} lan login that bai — brute force nghi ngo`);
        riskScore += Math.min(0.5, fails.length * 0.08);
      }

      const denied = ipSignals.filter(s => s.eventType === 'access_denied');
      if (denied.length >= 3) {
        reasons.push(`${denied.length} lan bi tu chau truy cap`);
        riskScore += 0.2;
      }

      // Bot detection: no user agent = HTTP-only bot
      const botSignals = ipSignals.filter(s => !s.userAgent || s.userAgent.length < 5);
      if (botSignals.length > 0) {
        reasons.push(`${botSignals.length} request khong co User-Agent — nghi ngo bot`);
        riskScore += 0.4;
      }

      riskScore = Math.min(1.0, riskScore);
      const level: ThreatReport['level'] = riskScore >= 0.6 ? 'threat' : riskScore >= 0.3 ? 'suspicious' : 'clean';

      if (level !== 'clean') {
        EventBus.emit('cell.metric', {
          cell: 'security-cell', metric: 'threat.risk_score',
          value: riskScore, confidence: 0.85, sourceIp: ip,
        });
      }

      reports.push({ sourceIp: ip, level, reasons, confidence: 0.85, blockRecommended: riskScore >= 0.7 });
    }

    return reports;
  }
}


