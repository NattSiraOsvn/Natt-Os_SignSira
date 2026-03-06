export interface WarehouseItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  weight?: number;
  value: number;
  currency: string;
  lotNumber?: string;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
}
