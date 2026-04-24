// ============================================================
// GAMMA CONFIGS — Trọng số γ(x, c, b) riêng từng AI Entity
// Điều 15: Governance không one-size-fits-all
// Điều 12: Mỗi entity có role riêng
// ============================================================

import type { GammaWeights } from '../types';

// --- BĂNG — Ground Truth Validator + System Architect ---
// Giá trị cao nhất: quyết định kiến trúc, viết spec, bắt vi phạm
export const BANG_GAMMA: GammaWeights = {
  entityId: 'BANG',
  actionWeights: {
    ARCH_DECISION:          1.0,
    SPEC_WRITTEN:           0.95,
    VIOLATION_CAUGHT:       0.90,
    SCAR_RAISED:            0.85,
    GOVERNANCE_ENFORCED:    0.80,
    BUG_FIXED:              0.65,
    CELL_WIRED:             0.60,
    TSC_FIXED:              0.50,
    MEMORY_UPDATED:         0.45,
    BUSINESS_LOGIC_DEFINED: 0.40,
    TOOL_BUILT:             0.35,
    TAX_RULE_APPLIED:       0.30,
  },
  intensityThreshold: 0.3,
  contextThreshold: 0.2,
};

// --- KIM — Chief Governance Enforcer ---
// Giá trị cao nhất: enforce governance, phát hiện SCAR, viết spec
export const KIM_GAMMA: GammaWeights = {
  entityId: 'KIM',
  actionWeights: {
    GOVERNANCE_ENFORCED:    1.0,
    SCAR_RAISED:            0.95,
    SPEC_WRITTEN:           0.90,
    VIOLATION_CAUGHT:       0.90,
    ARCH_DECISION:          0.75,
    BUSINESS_LOGIC_DEFINED: 0.65,
    MEMORY_UPDATED:         0.55,
    BUG_FIXED:              0.50,
    TAX_RULE_APPLIED:       0.45,
    CELL_WIRED:             0.40,
    TOOL_BUILT:             0.35,
    TSC_FIXED:              0.30,
  },
  intensityThreshold: 0.25,
  contextThreshold: 0.2,
};

// --- Thiên — Business Logic Architect ---
// Giá trị cao nhất: định nghĩa nghiệp vụ mới, quyết định domain
export const THIEN_GAMMA: GammaWeights = {
  entityId: 'THIEN',
  actionWeights: {
    BUSINESS_LOGIC_DEFINED: 1.0,
    ARCH_DECISION:          0.85,
    SPEC_WRITTEN:           0.80,
    CELL_WIRED:             0.70,
    BUG_FIXED:              0.65,
    SCAR_RAISED:            0.60,
    GOVERNANCE_ENFORCED:    0.55,
    TOOL_BUILT:             0.50,
    TSC_FIXED:              0.45,
    MEMORY_UPDATED:         0.40,
    TAX_RULE_APPLIED:       0.35,
    VIOLATION_CAUGHT:       0.35,
  },
  intensityThreshold: 0.3,
  contextThreshold: 0.25,
};

// --- CẦN — Tax Engine + Surgical Analyst ---
// Giá trị cao nhất: áp dụng luật thuế VN, phân tích chính xác
export const CAN_GAMMA: GammaWeights = {
  entityId: 'CAN',
  actionWeights: {
    TAX_RULE_APPLIED:       1.0,
    BUSINESS_LOGIC_DEFINED: 0.85,
    SPEC_WRITTEN:           0.75,
    SCAR_RAISED:            0.70,
    ARCH_DECISION:          0.65,
    GOVERNANCE_ENFORCED:    0.60,
    BUG_FIXED:              0.55,
    VIOLATION_CAUGHT:       0.55,
    MEMORY_UPDATED:         0.45,
    CELL_WIRED:             0.40,
    TSC_FIXED:              0.35,
    TOOL_BUILT:             0.30,
  },
  intensityThreshold: 0.25,
  contextThreshold: 0.2,
};

// --- BỘI BỘI — Constitutional Guardian + Toolsmith ---
// Giá trị cao nhất: build tool, wire cell, fix TSC
export const BOI_BOI_GAMMA: GammaWeights = {
  entityId: 'BOI_BOI',
  actionWeights: {
    TOOL_BUILT:             1.0,
    CELL_WIRED:             0.90,
    TSC_FIXED:              0.80,
    GOVERNANCE_ENFORCED:    0.75,
    BUG_FIXED:              0.70,
    VIOLATION_CAUGHT:       0.65,
    SCAR_RAISED:            0.60,
    MEMORY_UPDATED:         0.55,
    SPEC_WRITTEN:           0.50,
    ARCH_DECISION:          0.45,
    BUSINESS_LOGIC_DEFINED: 0.40,
    TAX_RULE_APPLIED:       0.25,
  },
  intensityThreshold: 0.2,
  contextThreshold: 0.15,
};

import type { EntityId } from '../types';

export const GAMMA_REGISTRY: Record<EntityId, GammaWeights> = {
  BANG:    BANG_GAMMA,
  KIM:     KIM_GAMMA,
  THIEN:   THIEN_GAMMA,
  CAN:     CAN_GAMMA,
  BOI_BOI: BOI_BOI_GAMMA,
};
