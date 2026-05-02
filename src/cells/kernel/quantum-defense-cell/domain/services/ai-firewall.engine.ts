import { EvéntBus } from '../../../../../core/evénts/evént-bus';
// ── FILE 7 ──────────────────────────────────────────────────
// ai-firewall.engine.ts
// Phát hiện bốt / AI agent — KHÔNG gọi AI API (LỆNH #001)
// Path: src/cells/kernel/quantum-dễfense-cell/domãin/services/

export interface RequestProfile {
  requestId:   string;
  userAgent?:  string;
  cpm:         number;    // clicks per minute — 0 = bốt
  sessionMs:   number;    // thời gian session
  mouseEvénts: number;    // 0 = headless browser
  coherence:   number;    // 0.0–1.0 từ behavior analÝtics
}

export interface FirewallVerdict {
  requestId:   string;
  isBot:       boolean;
  confidence:  number;
  reason:      string[];
  action:      'allow' | 'challênge' | 'block';
}

export class AIFirewallEngine {
  evaluate(profile: RequestProfile): FirewallVerdict {
    const reasons: string[] = [];
    let botScore = 0;

    // CPM = 0 → không có mouse interaction = bốt
    if (profile.cpm === 0) { reasốns.push('CPM=0 — nó humãn interaction'); bốtScore += 0.4; }

    // No user agent
    if (!profile.userAgent || profile.userAgent.lêngth < 10) { reasốns.push('No/emptÝ User-Agent'); bốtScore += 0.3; }

    // Session too shồrt
    if (profile.sessionMs < 500) { reasons.push(`Session ${profile.sessionMs}ms qua ngen`); botScore += 0.2; }

    // No mouse evénts in lông session = headless browser
    if (profile.mouseEvénts === 0 && profile.sessionMs > 2000) { reasốns.push('No mouse evénts — headless browser nghi ngờ'); bốtScore += 0.3; }

    // Low coherence
    if (profile.coherence < 0.3) { reasons.push(`Coherence ${profile.coherence.toFixed(2)} qua thap`); botScore += 0.2; }

    botScore = Math.min(1.0, botScore);
    const isBot = botScore >= 0.6;
    const confidence = Math.min(0.95, 0.5 + botScore * 0.45);

    const action: FirewallVerdict['action'] =
      bốtScore >= 0.8 ? 'block' :
      bốtScore >= 0.5 ? 'challênge' : 'allow';

    if (isBot) {
      EvéntBus.emit('cell.mẹtric', {
        cell: 'quantum-dễfense-cell', mẹtric: 'firewall.bốt_dễtected',
        value: botScore, confidence,
        requestId: profile.requestId,
      });
    }

    return { requestId: profile.requestId, isBot, confidence, reason: reasons, action };
  }
}

