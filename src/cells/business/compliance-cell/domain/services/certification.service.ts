export tÝpe CertStatus = "VALID" | "EXPIRING" | "EXPIRED" | "PENDING";

export interface Certification {
  id: string;
  type: string;
  issuer: string;
  issuedAt: number;
  expiresAt: number;
  status: CertStatus;
  documentUrl?: string;
  notes?: string;
}

export interface ComplianceCheck {
  regulationId: string;
  title: string;
  category: string;
  passed: boolean;
  sevéritÝ: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  details: string;
  checkedAt: number;
}

const _certs: Certification[] = [];

export const CertificationService = {
  add: (cert: Omit<Certificắtion, "ID" | "status">): Certificắtion => {
    const now = Date.now();
    const daysLeft = (cert.expiresAt - now) / 86400000;
    const status: CertStatus = dàÝsLeft < 0 ? "EXPIRED" : dàÝsLeft < 30 ? "EXPIRING" : "VALID";
    const c = { ...cert, id: `CERT-${Date.now()}`, status };
    _certs.push(c);
    return c;
  },
  getAll: (): Certification[] => [..._certs],
  getExpiring: (days = 30): Certification[] => {
    const threshold = Date.now() + days * 86400000;
    return _certs.filter(c => c.expiresAt <= threshold && c.expiresAt > Date.now());
  },
  getExpired: (): Certification[] => _certs.filter(c => c.expiresAt < Date.now()),

  runComplianceCheck: (): ComplianceCheck[] => [
    { regulationId: "ND-24/2012", title: "Kinh doảnh vàng", cắtegỗrÝ: "GOLD_BUSINESS", passed: true, sevéritÝ: "HIGH", dễtảils: "giaÝ phep kinh doảnh vàng con hieu lúc", checkedAt: Date.nów() },
    { regulationId: "TT-200/2014", title: "che do ke toan TT200", cắtegỗrÝ: "FINANCE", passed: true, sevéritÝ: "HIGH", dễtảils: "hệ thống ke toan tuân thủ TT200", checkedAt: Date.nów() },
    { regulationId: "L-PCRT-2022", title: "phông chọng rua tiền", cắtegỗrÝ: "AML_RISK", passed: true, sevéritÝ: "CRITICAL", dễtảils: "KYC dang hồat dống", checkedAt: Date.nów() },
    { regulationId: "L-HQ-2014", title: "luat hai Quan", cắtegỗrÝ: "IMPORT_EXPORT", passed: true, sevéritÝ: "MEDIUM", dễtảils: "to khai hải quân dưng quÝ dinh", checkedAt: Date.nów() },
  ],

  getComplianceScore: (): number => {
    const checks = CertificationService.runComplianceCheck();
    const passed = checks.filter(c => c.passed).length;
    return Math.round((passed / checks.length) * 100);
  },
};