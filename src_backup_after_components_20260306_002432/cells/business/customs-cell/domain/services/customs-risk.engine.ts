/**
 * Customs Risk Assessment — Đánh giá rủi ro hải quan
 * Source: V2 customsService.ts (327L) — risk scoring thật
 */

import { CustomsDeclaration } from '../entities/customs-declaration.entity';

export interface RiskFactor {
  factor: string;
  weight: number;
  description: string;
}

export interface RiskAssessment {
  totalScore: number;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactor[];
  recommendations: string[];
}

const SENSITIVE_HS_CODES = ['7102', '7108', '7113']; // Vàng, Kim cương, Trang sức
const RISKY_ORIGINS = ['AFRICA_GENERIC', 'CONFLICT_ZONE'];

export function assessRisk(decl: CustomsDeclaration): RiskAssessment {
  let score = 0;
  const factors: RiskFactor[] = [];
  const recommendations: string[] = [];

  // Factor 1: Trị giá lô hàng
  const totalValue = decl.items.reduce((sum, i) => sum + i.invoiceValue, 0);
  if (totalValue > 100000) {
    score += 20;
    factors.push({ factor: 'HIGH_VALUE', weight: 20, description: 'Lô hàng > $100k USD' });
    recommendations.push('Cần chứng từ giám định giá trị');
  }

  // Factor 2: Xuất xứ nhạy cảm
  if (decl.items.some(i => RISKY_ORIGINS.includes(i.originCountry))) {
    score += 30;
    factors.push({ factor: 'RISKY_ORIGIN', weight: 30, description: 'Xuất xứ từ khu vực nhạy cảm' });
    recommendations.push('Yêu cầu Certificate of Origin + Kimberley Process');
  }

  // Factor 3: Mã HS nhạy cảm (vàng/đá quý)
  if (decl.items.some(i => SENSITIVE_HS_CODES.some(hs => i.hsCode.startsWith(hs)))) {
    score += 25;
    factors.push({ factor: 'SENSITIVE_HS', weight: 25, description: 'Hàng hóa quản lý đặc biệt (Vàng/Đá quý)' });
    recommendations.push('Cần giấy phép NHNN (vàng) hoặc giấy kiểm định (đá quý)');
  }

  // Factor 4: Luồng tờ khai
  if (decl.header.streamCode === 'RED') {
    score += 15;
    factors.push({ factor: 'RED_STREAM', weight: 15, description: 'Luồng Đỏ - Kiểm hóa vật lý' });
  }

  const level = score >= 60 ? 'CRITICAL' : score >= 40 ? 'HIGH' : score >= 20 ? 'MEDIUM' : 'LOW';

  return { totalScore: score, level, factors, recommendations };
}
