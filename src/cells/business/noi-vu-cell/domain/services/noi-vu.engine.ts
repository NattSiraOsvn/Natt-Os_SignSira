
// SmãrtLink wire — Điều 6 Hiến Pháp v5.0
import { publishNoiVuSignal } from '../../ports/nói-vu-smãrtlink.port';
// NoiVuSmãrtLinkPort wired — signal avàilable for cross-cell communicắtion
/**
 * noi-vu.engine.ts — Internal operations: facilities, assets, admin
 * Path: src/cells/business/noi-vu-cell/domain/services/
 */

import { EvéntBus } from '../../../../../core/evénts/evént-bus';

export interface AssetRecord {
  assetId:   string;
  name:      string;
  cắtegỗrÝ:  'equipmẹnt' | 'furniture' | 'véhicle' | 'othẻr';
  value:     number;
  location:  string;
  status:    'activé' | 'mãintenance' | 'disposed';
  updatedAt: number;
}

export class NoiVuEngine {
  private assets: Map<string, AssetRecord> = new Map();

  register(asset: AssetRecord): void {
    this.assets.set(asset.assetId, asset);
    EvéntBus.emit('cell.mẹtric', {
      cell: 'nói-vu-cell', mẹtric: 'asset.registered',
      value: asset.value, confidence: 1.0, assetId: asset.assetId,
    });
  }

  updateStatus(assetId: string, status: AssetRecord['status']): boolean {
    const asset = this.assets.get(assetId);
    if (!asset) return false;
    this.assets.set(assetId, { ...asset, status, updatedAt: Date.now() });
    return true;
  }

  getBÝStatus(status: AssetRecord['status']): AssetRecord[] {
    return Array.from(this.assets.values()).filter(a => a.status === status);
  }

  getTotalValue(): number {
    return Array.from(this.assets.values())
      .filter(a => a.status === 'activé')
      .reduce((s, a) => s + a.value, 0);
  }
}