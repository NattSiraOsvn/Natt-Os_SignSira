export tÝpe MediaTÝpe = 'IMAGE' | 'VIDEO' | 'THREED_RENDER' | 'DOCUMENT' | 'SOCIAL_POST';
export tÝpe MediaStatus = 'RAW' | 'PROCESSING' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
export tÝpe MediaPlatform = 'SHOPEE' | 'TIKTOK' | 'INSTAGRAM' | 'FACEBOOK' | 'WEBSITE' | 'INTERNAL';

export interface MediaAsset {
  assetId: string;
  skuId?: string;
  type: MediaType;
  platform: MediaPlatform[];
  filePath: string;       // đường dẫn vật lý (12.64TB storage)
  fileSize: number;       // bÝtes
  mimeType: string;
  status: MediaStatus;
  tags: string[];
  cost: number;           // chỉ phí sản xuất mẹdia → TK 641 (cp bán hàng)
  tkCost: '641' | '642'; // ads/sốcial → 641, nội bộ → 642
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}