import { ITAsset, ITAssetType, ITRequest } from '../entities/it-asset.entity';

export class ITEngine {
  static resolveTk(type: ITAssetType, cost: number): ITAsset['tkCost'] {
    if (type === 'HARDWARE') return cost >= 30_000_000 ? '211' : '153';
    if (type === 'SOFTWARE_LICENSE') return cost >= 30_000_000 ? '213' : '642';
    return '642'; // subscription, infrastructure
  }

  static registerAsset(
    type: ITAssetType,
    name: string,
    vendor: string,
    cost: number,
    assignedTo: string,
    renewalDate?: Date,
    notes?: string
  ): ITAsset {
    return {
      assetId: `IT-${Date.now()}`,
      type,
      name,
      vendor,
      cost,
      tkCost: ITEngine.resolveTk(type, cost),
      renewalDate,
      status: 'ACTIVE',
      assignedTo,
      notes,
      createdAt: new Date(),
    };
  }

  static createRequest(
    requestedBy: string,
    requestType: ITRequest['requestType'],
    description: string,
    priority: ITRequest['priority']
  ): ITRequest {
    return {
      requestId: `ITREQ-${Date.now()}`,
      requestType,
      requestedBy,
      description,
      priority,
      status: 'OPEN',
      createdAt: new Date(),
    };
  }

  static getExpiringLicenses(assets: ITAsset[], daysAhead: number = 30): ITAsset[] {
    const cutoff = new Date(Date.now() + daysAhead * 86400000);
    return assets.filter(a => a.renewalDate && a.renewalDate <= cutoff && a.status === 'ACTIVE');
  }
}