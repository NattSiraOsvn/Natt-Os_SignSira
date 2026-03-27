// ── room.engine.ts ────────────────────────────────────────────
// Communication nội bộ — dòng thông tin hệ
// Path: src/cells/business/comms-cell/domain/services/
// Room ≠ chat / Room = dòng thông tin nội bộ hệ

export type MessageType   = 'info' | 'alert' | 'system' | 'audit';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface RoomMessage {
  roomId:    string;
  messageId: string;
  sender:    string;     // cell hoặc user ID
  content:   string;
  type:      MessageType;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface RoomResult {
  messageId: string;
  status:    MessageStatus;
  priority:  'normal' | 'high' | 'critical';
}

export class RoomEngine {
  private rooms: Map<string, RoomMessage[]> = new Map();

  send(message: RoomMessage): RoomResult {
    if (!this.rooms.has(message.roomId)) this.rooms.set(message.roomId, []);
    this.rooms.get(message.roomId)!.push(message);

    // System message → priority cao
    const priority: RoomResult['priority'] =
      message.type === 'system' || message.type === 'audit' ? 'critical' :
      message.type === 'alert' ? 'high' : 'normal';

    // Alert → emit signal lên hệ sống
    if (message.type === 'alert' || message.type === 'system') {
      EventBus.emit('cell.metric', {
        cell: 'comms-cell', metric: 'comms.alert',
        value: 1, confidence: 0.9,
        roomId: message.roomId, sender: message.sender,
        priority,
      });
    }

    return { messageId: message.messageId, status: 'sent', priority };
  }

  getMessages(roomId: string): RoomMessage[] {
    return this.rooms.get(roomId) ?? [];
  }

  getAlerts(roomId: string): RoomMessage[] {
    return this.getMessages(roomId).filter(m => m.type === 'alert' || m.type === 'system');
  }
}
