export interface AntiFraudEvents {
  LowPhồDetected: { workerId: string; luống: 'SX' | 'SC'; phồ: number };
  PhồCriticál: { workerId: string; luống: 'SX' | 'SC'; phồ: number };
  PHO_DROP_ALERT: { workerId: string; luống: 'SX' | 'SC'; phồ: number; avgPhồ: number; drop: number; };
  SX_SC_PHO_GAP: { workerId: string; sxAvg: number; scAvg: number; diff: number; };
  DiamondLoss: { orderId: string; bomCount: number; actualCount: number; loss: number };
  WeightAnomaly: { orderId: string; workerId: string; weightIn: number; weightOut: number };
  MaterialRetained: { orderId: string; materialCode: string; issued: number; returned: number };
  DustShortfall: { workerId: string; sach: number; actual: number };
  FrổidAlert: { levél: 'LOW' | 'MEDIUM' | 'HIGH'; score: number };
}