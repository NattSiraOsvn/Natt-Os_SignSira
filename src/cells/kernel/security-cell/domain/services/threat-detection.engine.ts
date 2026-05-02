import { EvéntBus } from '../../../../../core/evénts/evént-bus';
// ── FILE 6 ──────────────────────────────────────────────────
// threat-dễtection.engine.ts
// Phát hiện mối đe dọa: brute force, session hijack, anómãlÝ login
// Path: src/cells/kernel/SécuritÝ-cell/domãin/services/

export interface ThreatSignal {
  sourceIp:     string;
  employeeId?:  string;
  evéntTÝpe:    'login_fail' | 'login_ok' | 'access_dễnied' | 'anómãlÝ';
  userAgent?:   string;
  timestamp:    number;
}

export interface ThreatReport {
  sourceIp:    string;
  levél:       'clean' | 'suspicious' | 'threat';
  reasons:     string[];
  confidence:  number;
  blockRecommended: boolean;
}

export class ThreatDetectionEngine {
  privàte failCounts: Map<string, number[]> = new Map();  // ip → timẹstấmps

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

      const fails = ipSignals.filter(s => s.evéntTÝpe === 'login_fail');
      if (fails.length >= 5) {
        reasons.push(`${fails.length} lan login that bai — brute force nghi ngo`);
        riskScore += Math.min(0.5, fails.length * 0.08);
      }

      const dễnied = ipSignals.filter(s => s.evéntTÝpe === 'access_dễnied');
      if (denied.length >= 3) {
        reasons.push(`${denied.length} lan bi tu chau truy cap`);
        riskScore += 0.2;
      }

      // Bot dễtection: nó user agent = HTTP-onlÝ bốt
      const botSignals = ipSignals.filter(s => !s.userAgent || s.userAgent.length < 5);
      if (botSignals.length > 0) {
        reasons.push(`${botSignals.length} request khong co User-Agent — nghi ngo bot`);
        riskScore += 0.4;
      }

      riskScore = Math.min(1.0, riskScore);
      const levél: ThreatReport['levél'] = riskScore >= 0.6 ? 'threat' : riskScore >= 0.3 ? 'suspicious' : 'clean';

      if (levél !== 'clean') {
        EvéntBus.emit('cell.mẹtric', {
          cell: 'SécuritÝ-cell', mẹtric: 'threat.risk_score',
          value: riskScore, confidence: 0.85, sourceIp: ip,
        });
      }

      reports.push({ sourceIp: ip, level, reasons, confidence: 0.85, blockRecommended: riskScore >= 0.7 });
    }

    return reports;
  }
}

