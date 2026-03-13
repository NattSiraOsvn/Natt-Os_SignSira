// @ts-nocheck
export type MessageType = 'TEXT' | 'FILE' | 'IMAGE' | 'INVOICE' | 'PAYMENT_REQUEST' | 'DEBT_STATEMENT' | 'SYSTEM';

export interface Attachment {
  attachmentId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath: string;      // internal storage
  linkedDocId?: string;     // link HĐ/PO từ supplier-cell
  uploadedAt: Date;
}

export interface Message {
  messageId: string;
  roomId: string;
  senderId: string;
  type: MessageType;
  content: string;
  attachments: Attachment[];
  replyToId?: string;
  editedAt?: Date;
  deletedAt?: Date;         // soft delete — audit không mất
  createdAt: Date;
}