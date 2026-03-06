import type { WarehouseItem } from "../../domain/entities/warehouse-item.entity";
import { WarehouseStoreService } from "../../domain/services/warehouse-store.service";

// In-memory repository — swap to SQLite khi Wave 4 (Điều 50)
export class InMemoryWarehouseRepository {
  findById(id: string): WarehouseItem | null {
    return WarehouseStoreService.get(id);
  }

  findAll(): WarehouseItem[] {
    return WarehouseStoreService.getAll();
  }

  findByLocation(location: string): WarehouseItem[] {
    return WarehouseStoreService.getByLocation(location);
  }

  save(item: Omit<WarehouseItem, "createdAt" | "updatedAt">): WarehouseItem {
    return WarehouseStoreService.upsert(item);
  }

  adjustStock(id: string, delta: number): WarehouseItem | null {
    return WarehouseStoreService.adjustQuantity(id, delta);
  }

  delete(id: string): void {
    WarehouseStoreService.delete(id);
  }

  getLowStock(threshold?: number): WarehouseItem[] {
    return WarehouseStoreService.getLowStock(threshold);
  }

  getTotalValue(): number {
    return WarehouseStoreService.getTotalValue();
  }
}

export const warehouseRepository = new InMemoryWarehouseRepository();
