// @ts-nocheck
/**
 * stone-cell — domain/stone.entity.ts
 * Sprint 2 | Tâm Luxury NATT-OS
 *
 * Gắn đá vào phôi sau finishing.
 * Subscribe: WIP_IN_PROGRESS
 * Emit:      WIP_STONE
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type StoneType = 'DIAMOND_CENTER' | 'DIAMOND_SMALL' | 'RUBY' | 'SAPPHIRE' | 'EMERALD' | 'OTHER';
export type StoneStatus = 'PENDING' | 'SET' | 'REJECTED';

export interface StoneItem {
  stoneId:     string;
  stoneType:   StoneType;
  caratWeight: number;   // ct
  quantity:    number;
  status:      StoneStatus;
  setAt?:      Date;
  rejectedReason?: string;
}

export interface StoneRecord {
  id:        string;
  lapId:     string;
  orderId:   string;
  stones:    StoneItem[];
  workerId:  string;
  status:    'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt: Date;
  completedAt?: Date;
  note?:     string;
}

// ─── Factories ───────────────────────────────────────────────────────────────

export function createStoneRecord(
  lapId:    string,
  orderId:  string,
  workerId: string,
): StoneRecord {
  return {
    id:        `STN-${lapId}-${Date.now()}`,
    lapId,
    orderId,
    stones:    [],
    workerId,
    status:    'PENDING',
    startedAt: new Date(),
  };
}

export function addStoneItem(
  record:    StoneRecord,
  stoneType: StoneType,
  caratWeight: number,
  quantity:  number,
): StoneItem {
  const item: StoneItem = {
    stoneId:     `S-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    stoneType,
    caratWeight,
    quantity,
    status:      'PENDING',
  };
  record.stones.push(item);
  return item;
}

export function setStone(record: StoneRecord, stoneId: string): void {
  const item = record.stones.find(s => s.stoneId === stoneId);
  if (!item) throw new Error(`[stone-cell] Stone not found: ${stoneId}`);
  item.status = 'SET';
  item.setAt  = new Date();
}

export function rejectStone(record: StoneRecord, stoneId: string, reason: string): void {
  const item = record.stones.find(s => s.stoneId === stoneId);
  if (!item) throw new Error(`[stone-cell] Stone not found: ${stoneId}`);
  item.status = 'REJECTED';
  item.rejectedReason = reason;
}

export function isStoneCompleted(record: StoneRecord): boolean {
  return record.stones.every(s => s.status === 'SET' || s.status === 'REJECTED');
}
