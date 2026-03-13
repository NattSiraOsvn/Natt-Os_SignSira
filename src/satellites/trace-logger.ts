interface TraceConfig {
  cellId: string;
  domain: string;
}

export function createTraceLogger(config: TraceConfig) {
  return {
    info: (msg: string, data?: Record<string, unknown>) =>
      console.log(`[TRACE:${config.domain}:${config.cellId}] ${msg}`, data ?? ""),
    warn: (msg: string, data?: Record<string, unknown>) =>
      console.warn(`[TRACE:${config.domain}:${config.cellId}] ⚠️ ${msg}`, data ?? ""),
    error: (msg: string, data?: Record<string, unknown>) =>
      console.error(`[TRACE:${config.domain}:${config.cellId}] ❌ ${msg}`, data ?? ""),
    audit: (action: string, payload: Record<string, unknown>) =>
      console.log(`[AUDIT:${config.domain}:${config.cellId}] ${action}`, JSON.stringify(payload)),
  };
}
