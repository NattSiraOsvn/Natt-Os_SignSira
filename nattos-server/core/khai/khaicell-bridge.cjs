/**
 * KhaiCell Bridge (CommonJS) for legacy nattos-server.
 * Mirrors src/cells/kernel/khai-cell/ per SPEC NEN v1.1 section 4.1.
 *
 * KhaiCell = rao (boundary marker), KHONG cua (gate).
 *   - signal vuot duoc -> mark signature
 *   - khong validate, khong reject
 *   - emit vao field
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
      if (emitter && typeof emitter.emit === 'function') {
        emitter.emit('khai.touch.signed', { normalized, signature });
      }
      return { normalized, signature };
    },
  };
}

module.exports = { createKhaiCell };
