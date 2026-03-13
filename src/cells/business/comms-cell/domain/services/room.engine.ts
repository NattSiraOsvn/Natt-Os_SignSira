// @ts-nocheck
import { CommsSmartLinkPort } from "../../ports/comms-smartlink.port";
import { Room, RoomType, RoomMember } from '../entities/room.entity';

export class RoomEngine {
  static createPartnerRoom(
    partnerId: string,
    partnerName: string,
    linkedCellId: string,
    internalUserIds: string[]
  ): Room {
    const members: RoomMember[] = [
      ...internalUserIds.map(uid => ({ userId: uid, role: 'ADMIN' as const, joinedAt: new Date() })),
      { userId: partnerId, role: 'MEMBER' as const, joinedAt: new Date() },
    ];
    return {
      roomId: `ROOM-${Date.now()}`,
      name: `Partner: ${partnerName}`,
      type: 'PARTNER_CHANNEL',
      members,
      linkedCellId,
      linkedPartnerId: partnerId,
      isEncrypted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}