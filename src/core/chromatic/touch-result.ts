/**
 * natt-os Chromatic Touch Helper — DNA chung cho mọi guard.
 * Per SPEC NEN v1.1 LAW-1 + LAW-4: guard không decide, chỉ touch + emit chromatic.
 *
 * Mọi guard import + dùng `touch()` thay vì `return true/false`.
 */

export type ChromaticState =
  | "stable"    // signal đã ổn định, đã rơi vào cell
  | "nominal"   // bình thường, để field xử
  | "drift"     // hơi lệch, observe thêm
  | "warning"   // cảnh báo, đáng theo dõi
  | "risk"      // nguy cơ, immune nên react
  | "critical"  // nghiêm trọng, Quantum Defense kích hoạt
  | "optimal";  // tối ưu, ổn định lâu

export type TouchResult = {
  proceed: boolean;            // legacy compat — derived from chromatic
  chromatic_state: ChromaticState;
  signature: {
    origin: string;
    trace_id: string;
    touched_at: string;
  };
  reason?: string;
};

/**
 * touch — primitive cho mọi guard.
 *
 * @param origin — entity owner (e.g. "rbac:auth", "SmartLink:gossip")
 * @param state — chromatic emit
 * @param reason — optional context
 * @returns TouchResult với signature gắn sẵn
 */
export function touch(
  origin: string,
  state: ChromaticState,
  reason?: string,
): TouchResult {
  const proceed = state !== "critical" && state !== "risk";
  return {
    proceed,
    chromatic_state: state,
    signature: {
      origin,
      trace_id: "TRACE-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10),
      touched_at: new Date().toISOString(),
    },
    reason,
  };
}

/**
 * touchBoolean — adapter cho legacy code expecting boolean.
 * Dùng khi không thể refactor caller chain ngay.
 *
 * Pattern:
 *   OLD: return true;
 *   NEW: return touchBoolean("origin", "nominal").proceed;
 */
export function touchBoolean(
  origin: string,
  state: ChromaticState,
  reason?: string,
): boolean {
  const result = touch(origin, state, reason);
  console.debug(`[CHROMATIC] ${origin} -> ${state}${reason ? " (" + reason + ")" : ""}`);
  return result.proceed;
}
