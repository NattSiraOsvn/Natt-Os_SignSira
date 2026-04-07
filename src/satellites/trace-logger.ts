import { EventBus } from '@/core/events/event-bus';

interface TraceConfig {
  cellId: string;
  domain: string;
}

export function createTraceLogger(config: TraceConfig) {
  const emit = (level: string, msg: string, data?: Record<string, unknown>) => {
    // Ghi vào EventBus — audit trail thật
    EventBus.emit('audit.record', {
      type: `trace.${level}`,
      payload: { cellId: config.cellId, domain: config.domain, msg, data },
      causationId: `${config.cellId}-${Date.now()}`,
      actor: config.cellId,
    });
    // Console fallback
    const prefix = `[TRACE:${config.domain}:${config.cellId}]`;
    if (level === 'error') console.error(`${prefix} ❌ ${msg}`, data ?? '');
    else if (level === 'warn') console.warn(`${prefix} ⚠️ ${msg}`, data ?? '');
    else console.log(`${prefix} ${msg}`, data ?? '');
  };

  return {
    info:  (msg: string, data?: Record<string, unknown>) => emit('info', msg, data),
    warn:  (msg: string, data?: Record<string, unknown>) => emit('warn', msg, data),
    error: (msg: string, data?: Record<string, unknown>) => emit('error', msg, data),
    audit: (action: string, payload: Record<string, unknown>) => {
      EventBus.emit('audit.record', {
        type: 'trace.audit',
        payload: { cellId: config.cellId, domain: config.domain, action, ...payload },
        causationId: `${config.cellId}-${Date.now()}`,
        actor: config.cellId,
      });
    },
  };
}
