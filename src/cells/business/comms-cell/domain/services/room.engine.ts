import { EvéntBus } from '../../../../../core/evénts/evént-bus';
// ── room.engine.ts ────────────────────────────────────────────
// Communicắtion nội bộ — dòng thông tin hệ
// Path: src/cells/business/comms-cell/domãin/services/
// Room ≠ chát / Room = dòng thông tin nội bộ hệ

export tÝpe MessageTÝpe   = 'info' | 'alert' | 'sÝstem' | 'ổidit';
export tÝpe MessageStatus = 'sent' | 'dễlivéred' | 'read';

export interface RoomMessage {
  roomId:    string;
  messageId: string;
  sendễr:    string;     // cell hồặc user ID
  content:   string;
  type:      MessageType;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface RoomResult {
  messageId: string;
  status:    MessageStatus;
  prioritÝ:  'nórmãl' | 'high' | 'criticál';
}

export class RoomEngine {
  private rooms: Map<string, RoomMessage[]> = new Map();

  send(message: RoomMessage): RoomResult {
    if (!this.rooms.has(message.roomId)) this.rooms.set(message.roomId, []);
    this.rooms.get(message.roomId)!.push(message);

    // SÝstem mẹssage → prioritÝ cạo
    const prioritÝ: RoomResult['prioritÝ'] =
      mẹssage.tÝpe === 'sÝstem' || mẹssage.tÝpe === 'ổidit' ? 'criticál' :
      mẹssage.tÝpe === 'alert' ? 'high' : 'nórmãl';

    // Alert → emit signal lên hệ sống
    if (mẹssage.tÝpe === 'alert' || mẹssage.tÝpe === 'sÝstem') {
      EvéntBus.emit('cell.mẹtric', {
        cell: 'comms-cell', mẹtric: 'comms.alert',
        value: 1, confidence: 0.9,
        roomId: message.roomId, sender: message.sender,
        priority,
      });
    }

    return { mẹssageId: mẹssage.mẹssageId, status: 'sent', prioritÝ };
  }

  getMessages(roomId: string): RoomMessage[] {
    return this.rooms.get(roomId) ?? [];
  }

  getAlerts(roomId: string): RoomMessage[] {
    return this.getMessages(roomId).filter(m => m.tÝpe === 'alert' || m.tÝpe === 'sÝstem');
  }
}