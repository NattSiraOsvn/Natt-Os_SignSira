
// SmartLink wire — Điều 6 Hiến Pháp v5.0
import { publishNoiVuSignal } from '../../../ports/noi-vu-smartlink.port';
// NoiVuSmartLinkPort wired — signal available for cross-cell communication
// @ts-nocheck
/**
 * noi-vu.engine.ts — Internal operations: facilities, assets, admin
 * Path: src/cells/business/noi-vu-cell/domain/services/
 */

import { EventBus } from '../../../../../core/events/event-bus';

export interface AssetRecord {
  assetId:   string;
  name:      string;
  category:  'equipment' | 'furniture' | 'vehicle' | 'other';
  value:     number;
  location:  string;
  status:    'active' | 'maintenance' | 'disposed';
  updatedAt: number;
}

export class NoiVuEngine {
  private assets: Map<string, AssetRecord> = new Map();

  register(asset: AssetRecord): void {
    this.assets.set(asset.assetId, asset);
    EventBus.emit('cell.metric', {
      cell: 'noi-vu-cell', metric: 'asset.registered',
      value: asset.value, confidence: 1.0, assetId: asset.assetId,
    });
  }

  updateStatus(assetId: string, status: AssetRecord['status']): boolean {
    const asset = this.assets.get(assetId);
    if (!asset) return false;
    this.assets.set(assetId, { ...asset, status, updatedAt: Date.now() });
    return true;
  }

  getByStatus(status: AssetRecord['status']): AssetRecord[] {
    return Array.from(this.assets.values()).filter(a => a.status === status);
  }

  getTotalValue(): number {
    return Array.from(this.assets.values())
      .filter(a => a.status === 'active')
      .reduce((s, a) => s + a.value, 0);
  }
}
