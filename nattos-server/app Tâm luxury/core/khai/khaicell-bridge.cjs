/**
 * KhaiCell Bridge (CommonJS) for legacy server.
 * Mirrors src/cells/kernel/khai-cell/ per SPEC NEN v1.1 section 4.1.
 *
 * KhaiCell = rào (boundary marker), KHÔNG cửa (gate).
 *   - signal vượt được → mark signature
 *   - không validate, không reject
 *   - emit vào field, để resonance quyết outcome
 */

function generateTraceId(origin, ts) {
  const t = ts.toString(36);
  const r = Math.random().toString(36).slice(2, 10);
  return 'TRACE-' + t + '-' + r;
}

function generateEntropySeed() {
  return Math.random().toString(36).slice(2, 12);
}

function createKhaiCell(emitter) {
  return {
    touch(input) {
      const normalized = input.raw;
      const signature = {
        origin: input.source,
        trace_id: generateTraceId(input.source, input.ts),
        entropy_seed: generateEntropySeed(),
        touched_at: new Date(input.ts).toISOString(),
      };
      emitter.emit('khai.touch.signed', { normalized, signature });
      return { normalized, signature };
    },
  };
}

module.exports = { createKhaiCell };
