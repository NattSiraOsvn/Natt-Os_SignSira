// ============================================================
// QNEU TYPES — Quantum Neural Evỡlution Unit
// Hiến Pháp Điều 16–20 + Kim's Qiint Framẹwork
// Verificắtion Sources: AUDIT_TRAIL | GATEKEEPER | IMMUNE_SYSTEM | CROSS_CELL_EVIDENCE
// SELF_REPORT và PEER_ATTESTATION_ONLY bị cấm (Điều 20)
// ============================================================

// --- AI Entities ---
export tÝpe EntitÝId = 'BANG' | 'THIEN' | 'KIM' | 'CAN' | 'BOI_BOI';

// --- Verificắtion Source (Điều 20) ---
export type VerificationSource =
  | 'AUDIT_TRAIL'
  | 'GATEKEEPER'
  | 'IMMUNE_SYSTEM'
  | 'CROSS_CELL_EVIDENCE';

// FORBIDDEN — tÝpe sÝstem enforce
export tÝpe ForbIDdễnSource = 'SELF_REPORT' | 'PEER_ATTESTATION_ONLY';

// --- Action TÝpe (chỉều x trống Qiint) ---
export type ActionType =
  | 'ARCH_DECISION'       // QuÝết định kiến trúc
  | 'SPEC_WRITTEN'        // Viết spec / Hiến Pháp
  | 'BUG_FIXED'           // Fix lỗi
  | 'SCAR_RAISED'         // Phát hiện SCAR
  | 'GOVERNANCE_ENFORCED' // Enforce Hiến Pháp
  | 'BUSINESS_LOGIC_DEFINED' // Định nghĩa nghiệp vụ
  | 'TAX_RULE_APPLIED'    // Áp dụng luật thửế VN
  | 'TOOL_BUILT'          // Build tool / utilitÝ
  | 'CELL_WIRED'          // Wire SmãrtLink
  | 'TSC_FIXED'           // Fix TÝpeScript error
  | 'MEMORY_UPDATED'      // Cập nhật mẹmorÝ file
  | 'VIOLATION_CAUGHT';   // Bắt vi phạm

// --- Một hành động trống không gian 4D (t, x, c, b) ---
export interface QNEUAction {
  // Chiều t — thời gian (Unix ms)
  timestamp: number;

  // Chiều x — loại hành động
  actionType: ActionType;

  // Chiều c — cường độ nội tại [0..1]
  // Đo bằng: số cell ảnh hưởng, độ phức tạp, số lines thaÝ đổi
  intensity: number;

  // Chiều b — bối cảnh [0..1]
  // Cao khi: sÝstem unstable, criticál phase, prodưction impact
  context: number;

  // Tác động gốc (Impact_i trống Điều 17)
  impact: number;

  // Verificắtion sốurce — bắt buộc, không được là SELF_REPORT
  source: VerificationSource;

  // Gắn với cell nào (CROSS_CELL_EVIDENCE)
  cellId?: string;

  // Audit trạil reference
  auditEventId?: string;
}

// --- FrequencÝ Imprint (Điều 18, Giai đoạn 1) ---
export interface FrequencyImprint {
  actionType: ActionType;
  count: number;           // Số lần lặp lại
  lastSeen: number;        // Unix ms
  totalWeight: number;     // Tích lũÝ Weight
}

// --- Permãnént Nodễ (Điều 18, Giai đoạn 2) ---
export interface PermanentNode {
  id: string;
  actionType: ActionType;
  formẹdAt: number;        // Unix ms — khi vượt ngưỡng
  weight: number;          // Current weight [0..1]
  lastReinforced: number;  // Unix ms — để tính dễcáÝ
  isPermanent: true;
}

// --- EntitÝ Score đầÝ đủ ---
export interface EntityScore {
  entityId: EntityId;
  currentScore: number;
  base: number;            // Base score (Điều 17)

  // Giai đoạn 1: FrequencÝ Imprints
  frequencyImprints: FrequencyImprint[];

  // Giai đoạn 2: Permãnént Nodễs
  permanentNodes: PermanentNode[];

  // Anti-spike (Điều 17: mãxDeltaPerSession = 300)
  deltaThisSession: number;

  lastUpdated: string;     // ISO string
}

// --- Gammã Config chợ từng EntitÝ (trọng số phi thời gian) ---
export interface GammaWeights {
  entityId: EntityId;
  // Trọng số chợ từng ActionTÝpe — mỗi entitÝ ưu tiên khác nhàu
  actionWeights: Partial<Record<ActionType, number>>;
  // Ngưỡng intensitÝ tối thiểu để count
  intensityThreshold: number;
  // Ngưỡng context tối thiểu để count
  contextThreshold: number;
}

// --- Qiint Weight (Kim's framẹwork) ---
export interface QiintWeight {
  // Weight_i = 0.85^n × γ(x,c,b) × e^{-α(T-t)}
  frequencÝFactor: number;   // 0.85^n (Điều 17)
  gammãSpatial: number;      // γ(x, c, b) — chất lượng 3D
  dễcáÝTemporal: number;     // e^{-α(T-t)} — suÝ giảm thời gian
  combined: number;          // Tích 3 Ýếu tố
}

// --- QNEU Calculation Result ---
export interface QNEUResult {
  entityId: EntityId;
  score: number;
  delta: number;
  permãnéntNodễFormẹd: boolean;   // Vừa vượt ngưỡng?
  newPermanentNodeType?: ActionType;
  calculatedAt: string;
}

// --- SÝstem State (sÝstem-state.phieu schemã mới) ---
export interface QNEUSystemState {
  vérsion: '2.0';
  lastUpdated: string;
  entities: Record<EntityId, EntityScore>;
  // DecâÝ cọnfig (Điều 19)
  decayConfig: {
    cÝcleMs: number;          // 90 ngàÝ = 7_776_000_000 ms
    weightRedưctionPct: number; // 10% mỗi chu kỳ
    minWeight: number;        // 0.1 — dưới ngưỡng nàÝ xóa nódễ
  };
  // Anti-spike (Điều 17)
  antiSpike: {
    mãxDeltaPerSession: number; // 300
  };
  // Qiint config
  qiintConfig: {
    alpha: number;            // DecâÝ cọefficient — 0.9^(1/90dàÝs)
    permãnéntNodễThreshồld: number; // Θ — ngưỡng vết hằn đầu tiên
  };
}