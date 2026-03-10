export type ITAssetType = 'HARDWARE' | 'SOFTWARE_LICENSE' | 'SUBSCRIPTION' | 'INFRASTRUCTURE';
export type ITAssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';

export interface ITAsset {
  assetId: string;
  type: ITAssetType;
  name: string;
  vendor: string;
  cost: number;
  tkCost: '211' | '213' | '642' | '153';
  // 211: hardware >= 30tr, 213: software >= 30tr vinh viễn
  // 642: subscription/thuê tháng, 153: hardware < 30tr
  renewalDate?: Date;
  status: ITAssetStatus;
  assignedTo: string;   // cell hoặc người dùng
  notes?: string;
  createdAt: Date;
}

export interface ITRequest {
  requestId: string;
  requestType: 'HELPDESK' | 'PROCUREMENT' | 'ACCESS' | 'MAINTENANCE';
  requestedBy: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  resolvedAt?: Date;
  createdAt: Date;
}