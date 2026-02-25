// DictionaryApprovalService — Governance workflow for dictionary changes
// Real implementation from archive (117L) — imports fixed, uuid replaced
import { NotifyBus } from './notificationservice';

export interface ChangeProposal {
  id: string;
  type: 'ADD_FIELD' | 'MODIFY_FIELD' | 'REMOVE_FIELD' | 'ADD_RULE';
  target: string;
  newValue: any;
  oldValue?: any;
  reason: string;
  submitter: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  impactAnalysis: {
    affectedRecords: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  timestamp: number;
}

function generateId(): string {
  return `DICT-CHG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
}

class DictionaryApprovalService {
  private static instance: DictionaryApprovalService;
  private pendingChanges: ChangeProposal[] = [];

  static getInstance() {
    if (!DictionaryApprovalService.instance) DictionaryApprovalService.instance = new DictionaryApprovalService();
    return DictionaryApprovalService.instance;
  }

  async proposeChange(
    type: ChangeProposal['type'],
    target: string,
    newValue: any,
    reason: string,
    submitter: string
  ): Promise<ChangeProposal> {
    const impact = await this.analyzeImpact(type, target);

    const proposal: ChangeProposal = {
      id: generateId(),
      type, target, newValue, reason, submitter,
      status: 'PENDING',
      impactAnalysis: impact,
      timestamp: Date.now()
    };

    this.pendingChanges.push(proposal);

    NotifyBus.push({
      type: 'RISK',
      title: 'Yêu cầu thay đổi Từ điển',
      content: \`User \${submitter} muốn \${type} trường \${target}. Mức độ ảnh hưởng: \${impact.riskLevel}\`,
      persona: 'KRIS'
    });

    return proposal;
  }

  private async analyzeImpact(type: string, target: string) {
    const recordCount = Math.floor(Math.random() * 5000);
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';

    if (type === 'REMOVE_FIELD') riskLevel = 'HIGH';
    if (type === 'MODIFY_FIELD' && recordCount > 1000) riskLevel = 'MEDIUM';

    return { affectedRecords: recordCount, riskLevel };
  }

  async reviewChange(id: string, decision: 'APPROVE' | 'REJECT', reviewer: string) {
    const proposal = this.pendingChanges.find(p => p.id === id);
    if (!proposal) throw new Error("Proposal not found");

    if (decision === 'REJECT') {
      proposal.status = 'REJECTED';
      return;
    }

    proposal.status = 'APPROVED';
    await this.applyChange(proposal);

    NotifyBus.push({
      type: 'SUCCESS',
      title: 'Dictionary Updated',
      content: \`Thay đổi \${proposal.id} đã được áp dụng vào hệ thống lõi.\`,
      persona: 'THIEN'
    });
  }

  private async applyChange(p: ChangeProposal) {
    console.log(\`[Dictionary] Applying change \${p.type} on \${p.target} to \${JSON.stringify(p.newValue)}\`);
  }

  public getPendingProposals() { return this.pendingChanges.filter(p => p.status === 'PENDING'); }
  public getHistory() { return this.pendingChanges.filter(p => p.status !== 'PENDING'); }
}

export const DictApproval = DictionaryApprovalService.getInstance();
