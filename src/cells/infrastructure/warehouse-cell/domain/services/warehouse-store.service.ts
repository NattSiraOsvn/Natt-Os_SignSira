import type { WarehouseItem } from "../entities/warehouse-item.entity";
const _store = new Map<string, WarehouseItem>();

export const WarehouseStoreService = {
  upsert: (item: Omit<WarehouseItem, "createdAt" | "updatedAt">): WarehouseItem => {
    const existing = _store.get(item.id);
    const record: WarehouseItem = {
      ...item,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };
    _store.set(item.id, record);
    return record;
  },
  get: (id: string): WarehouseItem | null => _store.get(id) ?? null,
  getBySku: (sku: string): WarehouseItem | null =>
    [..._store.values()].find(i => i.sku === sku) ?? null,
  getAll: (): WarehouseItem[] => [..._store.values()],
  getByLocation: (location: string): WarehouseItem[] =>
    [..._store.values()].filter(i => i.location === location),
  adjustQuantity: (id: string, delta: number): WarehouseItem | null => {
    const item = _store.get(id);
    if (!item) return null;
    const updated = { ...item, quantity: Math.max(0, item.quantity + delta), updatedAt: Date.now() };
    _store.set(id, updated);
    return updated;
  },
  delete: (id: string): void => { _store.delete(id); },
  getLowStock: (threshold = 5): WarehouseItem[] =>
    [..._store.values()].filter(i => i.quantity <= threshold),
  getTotalValue: (): number =>
    [..._store.values()].reduce((s, i) => s + i.value * i.quantity, 0),
};
