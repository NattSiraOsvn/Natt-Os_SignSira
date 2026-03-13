/**
 * anti-fraud.events.ts
 * 
 * Event contracts cho anti-fraud system.
 * SmartLink truyền giữa: production-cell ↔ dust-recovery-cell ↔ stone-cell ↔ audit-cell
 */

// ═══════════ WEIGH EVENTS ═══════════
export interface WeighInEvent {
  type: "workshop:weigh_in";
  orderId: string;
  workerId: string;
  stream: "SX" | "SC-BH-KB";
  weightProductChi: number;
  materialsIssued: Array<{ type: string; weightChi: number; pxk?: string }>;
  timestamp: number;
}

export interface WeighOutEvent {
  type: "workshop:weigh_out";
  orderId: string;
  workerId: string;
  stream: "SX" | "SC-BH-KB";
  weightProductChi: number;
  dustChi: number;
  timestamp: number;
}

// ═══════════ DUST EVENTS ═══════════
export interface DustCollectedEvent {
  type: "dust:collected";
  workerId: string;
  stream: "SX" | "SC-BH-KB";
  date: string;
  dustBookValue: number;
  dustActualValue: number;
}

export interface DustSmeltedEvent {
  type: "dust:smelted";
  workerId: string;
  stream: "SX" | "SC-BH-KB";
  period: string;
  weightBeforeSmelt: number;
  weightAfterSmelt: number;
  phoPercent: number;
  quy750: number;
  labReportId: string;
}

// ═══════════ DIAMOND EVENTS ═══════════
export interface DiamondIssuedEvent {
  type: "diamond:issued";
  orderId: string;
  workerId: string;
  stream: "SX" | "SC-BH-KB";
  bomLines: Array<{ code: string; quantity: number; caratPerPiece: number }>;
  totalPieces: number;
  totalCarat: number;
  issuedBy: string;
  timestamp: number;
}

export interface DiamondReturnedEvent {
  type: "diamond:returned";
  orderId: string;
  workerId: string;
  actualUsedPieces: number;
  returnedPieces: number;
  brokenPieces: number;
  verifiedBy: string;
  timestamp: number;
}

// ═══════════ MATERIAL EVENTS ═══════════
export interface MaterialIssuedEvent {
  type: "material:issued";
  orderId: string;
  workerId: string;
  materialType: string;
  weightChi: number;
  pxkNumber: string;
  stream: "SX" | "SC-BH-KB";
  timestamp: number;
}

// ═══════════ AUDIT OUTPUT EVENTS ═══════════
export interface FlagRaisedEvent {
  type: "audit:weight_flag" | "audit:pho_flag" | "audit:diamond_flag";
  flagCode: string;
  severity: "INFO" | "WARN" | "CRITICAL" | "BLOCK";
  workerId: string;
  orderId?: string;
  message: string;
  timestamp: number;
}

export interface WorkerRiskUpdatedEvent {
  type: "audit:worker_risk";
  workerId: string;
  workerName: string;
  period: string;
  compositeScore: number;
  riskLevel: "GREEN" | "YELLOW" | "ORANGE" | "RED" | "BLACK";
  requiresGatekeeperReview: boolean;
  timestamp: number;
}

export interface GatekeeperAlertEvent {
  type: "audit:gatekeeper_alert";
  alertId: string;
  category: "WEIGHT" | "PHO" | "DIAMOND" | "COMPOSITE";
  workerId: string;
  workerName: string;
  summary: string;
  urgency: "NORMAL" | "HIGH" | "IMMEDIATE";
  timestamp: number;
}

// ═══════════ Union type ═══════════
export type AntiFraudEvent =
  | WeighInEvent
  | WeighOutEvent
  | DustCollectedEvent
  | DustSmeltedEvent
  | DiamondIssuedEvent
  | DiamondReturnedEvent
  | MaterialIssuedEvent
  | FlagRaisedEvent
  | WorkerRiskUpdatedEvent
  | GatekeeperAlertEvent;
