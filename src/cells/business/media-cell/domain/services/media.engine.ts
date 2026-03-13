// @ts-nocheck
import { MediaSmartLinkPort } from "../../ports/media-smartlink.port";
import { MediaAsset, MediaType, MediaPlatform } from '../entities/media-asset.entity';

export class MediaEngine {
  static registerAsset(
    skuId: string,
    type: MediaType,
    platform: MediaPlatform[],
    filePath: string,
    fileSize: number,
    mimeType: string,
    cost: number,
    tags: string[]
  ): MediaAsset {
    const isSalesPlatform = platform.some(p => ['SHOPEE','TIKTOK','INSTAGRAM','FACEBOOK','WEBSITE'].includes(p));
    return {
      assetId: `MEDIA-${Date.now()}`,
      skuId,
      type,
      platform,
      filePath,
      fileSize,
      mimeType,
      status: 'RAW',
      tags,
      cost,
      tkCost: isSalesPlatform ? '641' : '642',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static publish(asset: MediaAsset): MediaAsset {
    return { ...asset, status: 'PUBLISHED', publishedAt: new Date(), updatedAt: new Date() };
  }

  static archive(asset: MediaAsset): MediaAsset {
    return { ...asset, status: 'ARCHIVED', updatedAt: new Date() };
  }

  static totalCostByPeriod(assets: MediaAsset[], tk: '641' | '642'): number {
    return assets.filter(a => a.tkCost === tk).reduce((s, a) => s + a.cost, 0);
  }
}