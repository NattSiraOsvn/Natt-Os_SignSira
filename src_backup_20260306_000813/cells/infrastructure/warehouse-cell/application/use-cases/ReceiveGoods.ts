/**
 * ReceiveGoods Use Case
 * Cell: WAREHOUSE-cell | Layer: Application
 */
import { IWarehouseRepository } from '../../ports/WarehouseRepository';
import { WarehouseItem } from '../../domain/entities/warehouse.entity';

export class ReceiveGoods {
  constructor(private readonly repo: IWarehouseRepository) {}

  async execute(item: WarehouseItem): Promise<void> {
    await this.repo.save(item);
  }
}
