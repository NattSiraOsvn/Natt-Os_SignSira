
export type FailureMode = 'TRANSIENT' | 'POLICY_FAIL' | 'PERMANENT' | 'CIRCUIT_OPEN';
export interface RetryDecision { action: 'RETRY'|'REROUTE'|'DEAD_LETTER'|'DISCARD'; delayMs: number; reason: string; }

export function resolveRetry(attempt: number, mode: FailureMode): RetryDecision {
  if (mode === 'PERMANENT')    return { action: 'DEAD_LETTER', delayMs: 0,    reason: 'Permanent failure' };
  if (mode === 'CIRCUIT_OPEN') return { action: 'REROUTE',     delayMs: 0,    reason: 'Circuit open — reroute' };
  if (mode === 'POLICY_FAIL' && attempt >= 1) return { action: 'DEAD_LETTER', delayMs: 0, reason: 'Policy invalid' };
  if (attempt >= 3)            return { action: 'DEAD_LETTER', delayMs: 0,    reason: 'Max retries exceeded' };
  const delayMs = Math.pow(2, attempt) * 500; // exponential backoff: 500, 1000, 2000ms
  return { action: 'RETRY', delayMs, reason: `Attempt ${attempt + 1}` };
}
