export interface AntiFraudEvents {
  LowPhoDetected: { workerId: string; luong: 'SX' | 'SC'; pho: number };
  PhoCritical: { workerId: string; luong: 'SX' | 'SC'; pho: number };
  PHO_DROP_ALERT: { workerId: string; luong: 'SX' | 'SC'; pho: number; avgPho: number; drop: number; };
  SX_SC_PHO_GAP: { workerId: string; sxAvg: number; scAvg: number; diff: number; };
  DiamondLoss: { orderId: string; bomCount: number; actualCount: number; loss: number };
  WeightAnomaly: { orderId: string; workerId: string; weightIn: number; weightOut: number };
  MaterialRetained: { orderId: string; materialCode: string; issued: number; returned: number };
  DustShortfall: { workerId: string; sach: number; actual: number };
  FraudAlert: { level: 'LOW' | 'MEDIUM' | 'HIGH'; score: number };
}
