import { EventBus } from '../../../../../core/events/event-bus';
// ── FILE 7 ──────────────────────────────────────────────────
// ai-firewall.engine.ts
// Phát hiện bot / AI agent — KHÔNG gọi AI API (LỆNH #001)
// Path: src/cells/kernel/quantum-defense-cell/domain/services/

export interface RequestProfile {
  requestId:   string;
  userAgent?:  string;
  cpm:         number;    // clicks per minute — 0 = bot
  sessionMs:   number;    // thời gian session
  mouseEvents: number;    // 0 = headless browser
  coherence:   number;    // 0.0–1.0 từ behavior analytics
}

export interface FirewallVerdict {
  requestId:   string;
  isBot:       boolean;
  confidence:  number;
  reason:      string[];
  action:      'allow' | 'challenge' | 'block';
}

export class AIFirewallEngine {
  evaluate(profile: RequestProfile): FirewallVerdict {
    const reasons: string[] = [];
    let botScore = 0;

    // CPM = 0 → không có mouse interaction = bot
    if (profile.cpm === 0) { reasons.push('CPM=0 — no human interaction'); botScore += 0.4; }

    // No user agent
    if (!profile.userAgent || profile.userAgent.length < 10) { reasons.push('No/empty User-Agent'); botScore += 0.3; }

    // Session too short
    if (profile.sessionMs < 500) { reasons.push(`Session ${profile.sessionMs}ms quá ngắn`); botScore += 0.2; }

    // No mouse events in long session = headless browser
    if (profile.mouseEvents === 0 && profile.sessionMs > 2000) { reasons.push('No mouse events — headless browser nghi ngờ'); botScore += 0.3; }

    // Low coherence
    if (profile.coherence < 0.3) { reasons.push(`Coherence ${profile.coherence.toFixed(2)} quá thấp`); botScore += 0.2; }

    botScore = Math.min(1.0, botScore);
    const isBot = botScore >= 0.6;
    const confidence = Math.min(0.95, 0.5 + botScore * 0.45);

    const action: FirewallVerdict['action'] =
      botScore >= 0.8 ? 'block' :
      botScore >= 0.5 ? 'challenge' : 'allow';

    if (isBot) {
      EventBus.emit('cell.metric', {
        cell: 'quantum-defense-cell', metric: 'firewall.bot_detected',
        value: botScore, confidence,
        requestId: profile.requestId,
      });
    }

    return { requestId: profile.requestId, isBot, confidence, reason: reasons, action };
  }
}


