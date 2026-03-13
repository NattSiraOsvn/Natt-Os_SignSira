// @ts-nocheck
export type RoomType = 'DIRECT' | 'GROUP' | 'PARTNER_CHANNEL' | 'BROADCAST';

export interface RoomMember {
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'READ_ONLY';
  joinedAt: Date;
}

export interface Room {
  roomId: string;
  name: string;
  type: RoomType;
  members: RoomMember[];
  linkedCellId?: string;   // gắn với supplier/order/customs
  linkedPartnerId?: string;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}