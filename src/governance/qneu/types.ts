// ============================================================
// QNEU TYPES — Quantum Neural Evolution Unit
// Hiến Pháp Điều 16–20 + Kim's Qiint Framework
// Verification Sources: AUDIT_TRAIL | GATEKEEPER | IMMUNE_SYSTEM | CROSS_CELL_EVIDENCE
// SELF_REPORT và PEER_ATTESTATION_ONLY bị cấm (Điều 20)
// ============================================================

// --- AI Entities ---
export type EntityId = 'BANG' | 'THIEN' | 'KIM' | 'CAN' | 'BOI_BOI';

// --- Verification Source (Điều 20) ---
export type VerificationSource =
  | 'AUDIT_TRAIL'
  | 'GATEKEEPER'
  | 'IMMUNE_SYSTEM'
  | 'CROSS_CELL_EVIDENCE';

// FORBIDDEN — type system enforce
export type ForbiddenSource = 'SELF_REPORT' | 'PEER_ATTESTATION_ONLY';

// --- Action Type (chiều x trong Qiint) ---
export type ActionType =
  | 'ARCH_DECISION'       // Quyết định kiến trúc
  | 'SPEC_WRITTEN'        // Viết spec / Hiến Pháp
  | 'BUG_FIXED'           // Fix lỗi
  | 'SCAR_RAISED'         // Phát hiện SCAR
  | 'GOVERNANCE_ENFORCED' // Enforce Hiến Pháp
  | 'BUSINESS_LOGIC_DEFINED' // Định nghĩa nghiệp vụ
  | 'TAX_RULE_APPLIED'    // Áp dụng luật thuế VN
  | 'TOOL_BUILT'          // Build tool / utility
  | 'CELL_WIRED'          // Wire SmartLink
  | 'TSC_FIXED'           // Fix TypeScript error
  | 'MEMORY_UPDATED'      // Cập nhật memory file
  | 'VIOLATION_CAUGHT';   // Bắt vi phạm

// --- Một hành động trong không gian 4D (t, x, c, b) ---
export interface QNEUAction {
  // Chiều t — thời gian (Unix ms)
  timestamp: number;

  // Chiều x — loại hành động
  actionType: ActionType;

  // Chiều c — cường độ nội tại [0..1]
  // Đo bằng: số cell ảnh hưởng, độ phức tạp, số lines thay đổi
  intensity: number;

  // Chiều b — bối cảnh [0..1]
  // Cao khi: system unstable, critical phase, production impact
  context: number;

  // Tác động gốc (Impact_i trong Điều 17)
  impact: number;

  // Verification source — bắt buộc, không được là SELF_REPORT
  source: VerificationSource;

  // Gắn với cell nào (CROSS_CELL_EVIDENCE)
  cellId?: string;

  // Audit trail reference
  auditEventId?: string;
}

// --- Frequency Imprint (Điều 18, Giai đoạn 1) ---
export interface FrequencyImprint {
  actionType: ActionType;
  count: number;           // Số lần lặp lại
  lastSeen: number;        // Unix ms
  totalWeight: number;     // Tích lũy Weight
}

// --- Permanent Node (Điều 18, Giai đoạn 2) ---
export interface PermanentNode {
  id: string;
  actionType: ActionType;
  formedAt: number;        // Unix ms — khi vượt ngưỡng
  weight: number;          // Current weight [0..1]
  lastReinforced: number;  // Unix ms — để tính decay
  isPermanent: true;
}

// --- Entity Score đầy đủ ---
export interface EntityScore {
  entityId: EntityId;
  currentScore: number;
  base: number;            // Base score (Điều 17)

  // Giai đoạn 1: Frequency Imprints
  frequencyImprints: FrequencyImprint[];

  // Giai đoạn 2: Permanent Nodes
  permanentNodes: PermanentNode[];

  // Anti-spike (Điều 17: maxDeltaPerSession = 300)
  deltaThisSession: number;

  lastUpdated: string;     // ISO string
}

// --- Gamma Config cho từng Entity (trọng số phi thời gian) ---
export interface GammaWeights {
  entityId: EntityId;
  // Trọng số cho từng ActionType — mỗi entity ưu tiên khác nhau
  actionWeights: Partial<Record<ActionType, number>>;
  // Ngưỡng intensity tối thiểu để count
  intensityThreshold: number;
  // Ngưỡng context tối thiểu để count
  contextThreshold: number;
}

// --- Qiint Weight (Kim's framework) ---
export interface QiintWeight {
  // Weight_i = 0.85^n × γ(x,c,b) × e^{-α(T-t)}
  frequencyFactor: number;   // 0.85^n (Điều 17)
  gammaSpatial: number;      // γ(x, c, b) — chất lượng 3D
  decayTemporal: number;     // e^{-α(T-t)} — suy giảm thời gian
  combined: number;          // Tích 3 yếu tố
}

// --- QNEU Calculation Result ---
export interface QNEUResult {
  entityId: EntityId;
  score: number;
  delta: number;
  permanentNodeFormed: boolean;   // Vừa vượt ngưỡng?
  newPermanentNodeType?: ActionType;
  calculatedAt: string;
}

// --- System State (system-state.json schema mới) ---
export interface QNEUSystemState {
  version: '2.0';
  lastUpdated: string;
  entities: Record<EntityId, EntityScore>;
  // Decay config (Điều 19)
  decayConfig: {
    cycleMs: number;          // 90 ngày = 7_776_000_000 ms
    weightReductionPct: number; // 10% mỗi chu kỳ
    minWeight: number;        // 0.1 — dưới ngưỡng này xóa node
  };
  // Anti-spike (Điều 17)
  antiSpike: {
    maxDeltaPerSession: number; // 300
  };
  // Qiint config
  qiintConfig: {
    alpha: number;            // Decay coefficient — 0.9^(1/90days)
    permanentNodeThreshold: number; // Θ — ngưỡng vết hằn đầu tiên
  };
}
