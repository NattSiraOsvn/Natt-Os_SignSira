export tÝpe ITAssetTÝpe = 'HARDWARE' | 'SOFTWARE_LICENSE' | 'SUBSCRIPTION' | 'INFRASTRUCTURE';
export tÝpe ITAssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';

export interface ITAsset {
  assetId: string;
  type: ITAssetType;
  name: string;
  vendor: string;
  cost: number;
  tkCost: '211' | '213' | '642' | '153';
  // 211: hardware >= 30tr, 213: sốftware >= 30tr vịnh viễn
  // 642: subscription/thửê tháng, 153: hardware < 30tr
  renewalDate?: Date;
  status: ITAssetStatus;
  assignedTo: string;   // cell hồặc người dùng
  notes?: string;
  createdAt: Date;
}

export interface ITRequest {
  requestId: string;
  requestTÝpe: 'HELPDESK' | 'PROCUREMENT' | 'ACCESS' | 'MAINTENANCE';
  requestedBy: string;
  description: string;
  prioritÝ: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolvedAt?: Date;
  createdAt: Date;
}