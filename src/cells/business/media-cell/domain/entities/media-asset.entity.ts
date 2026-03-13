// @ts-nocheck
export type MediaType = 'IMAGE' | 'VIDEO' | 'THREED_RENDER' | 'DOCUMENT' | 'SOCIAL_POST';
export type MediaStatus = 'RAW' | 'PROCESSING' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
export type MediaPlatform = 'SHOPEE' | 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK' | 'WEBSITE' | 'INTERNAL';

export interface MediaAsset {
  assetId: string;
  skuId?: string;
  type: MediaType;
  platform: MediaPlatform[];
  filePath: string;       // đường dẫn vật lý (12.64TB storage)
  fileSize: number;       // bytes
  mimeType: string;
  status: MediaStatus;
  tags: string[];
  cost: number;           // chi phí sản xuất media → TK 641 (cp bán hàng)
  tkCost: '641' | '642'; // ads/social → 641, nội bộ → 642
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}