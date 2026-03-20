export interface FreezeProposal {
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  evidence: any;
  suggestedDuration?: number; // milliseconds
}

export async function proposeFreeze(validationResults: {
  graphIssues: any[];
  anomalies: any[];
  blindspots: any[];
}): Promise<FreezeProposal | null> {
  const { graphIssues, anomalies, blindspots } = validationResults;

  // Tiêu chí FREEZE
  if (graphIssues.length > 5) {
    return {
      reason: 'Quá nhiều mâu thuẫn trong đồ thị MAIN, có nguy cơ mất ổn định dữ liệu tiến hóa.',
      severity: 'HIGH',
      evidence: { graphIssues }
    };
  }

  if (anomalies.some(a => a.severity === 'HIGH')) {
    return {
      reason: 'Phát hiện defensive contraction nghiêm trọng ở persona chủ chốt.',
      severity: 'HIGH',
      evidence: { anomalies: anomalies.filter(a => a.severity === 'HIGH') }
    };
  }

  if (blindspots.length > 3 && blindspots.some(b => b.severity === 'HIGH')) {
    return {
      reason: 'Phát hiện nhiều điểm mù chung mức độ cao.',
      severity: 'HIGH',
      evidence: { blindspots: blindspots.filter(b => b.severity === 'HIGH') }
    };
  }

  return null;
}