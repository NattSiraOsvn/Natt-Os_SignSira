export interface CustomsCellContract {
  'customs.declaration.prepared': { declarationNo: string; type: string; itemCount: number };
  'customs.risk.assessed': { declarationNo: string; riskLevel: string; score: number };
  'customs.cleared': { declarationNo: string; totalDuty: number; totalVAT: number };
  'customs.held': { declarationNo: string; reason: string };
}
