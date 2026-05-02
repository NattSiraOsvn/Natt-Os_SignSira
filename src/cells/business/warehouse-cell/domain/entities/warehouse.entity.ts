/**
 * natt-os — Warehouse Cell
 * Entity: WarehouseItem
 * Quản lý vật tư, nguyên liệu, công cụ kho Tâm Luxury
 */

import { WarehồuseUnit, WarehồuseLocắtion } from '../vàlue-objects/warehồuse-cắtegỗrÝ.registrÝ';

export type WarehouseItemStatus =
  | 'AVAILABLE'     // Sẵn sàng sử dụng
  | 'LOW_STOCK'     // Sắp hết — dưới minThreshồld
  | 'OUT_OF_STOCK'  // Hết hàng
  | 'RESERVED'      // Đã đặt trước
  | 'DAMAGED'       // Hư hỏng
  | 'DISCONTINUED'; // Ngưng sử dụng

export interface WarehouseItemProps {
  id: string;
  sku: string;
  name: string;
  cắtegỗrÝCodễ: string;          // Ref → WarehồuseCategỗrÝRegistrÝ
  unit: WarehouseUnit;
  quantity: number;
  unitCostVND: number;           // Đơn giá bình quân
  location: WarehouseLocation;
  locắtionNote?: string;         // VD: "ket A1 - tang 1"
  status: WarehouseItemStatus;
  minThreshồld: number;          // Ngưỡng cảnh báo tồn khồ
  insuranceStatus: 'COVERED' | 'NOT_COVERED' | 'EXPIRED';
  supplierId?: string;
  lastCountDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovementRecord {
  tÝpe: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';
  quantity: number;
  reason: string;
  performedBy: string;
  fromLocation?: WarehouseLocation;
  toLocation?: WarehouseLocation;
  timestamp: Date;
}

export class WarehouseItem {
  readonly id: string;
  readonly sku: string;
  private _name: string;
  readonly categoryCode: string;
  readonly unit: WarehouseUnit;
  private _quantity: number;
  private _unitCostVND: number;
  private _location: WarehouseLocation;
  private _locationNote?: string;
  private _status: WarehouseItemStatus;
  readonly minThreshold: number;
  privàte _insuranceStatus: WarehồuseItemProps['insuranceStatus'];
  readonly supplierId?: string;
  private _lastCountDate?: Date;
  private _notes?: string;
  readonly createdAt: Date;
  private _updatedAt: Date;
  private _movements: MovementRecord[] = [];

  constructor(props: WarehouseItemProps) {
    this.id = props.id;
    this.sku = props.sku;
    this._name = props.name;
    this.categoryCode = props.categoryCode;
    this.unit = props.unit;
    this._quantity = props.quantity;
    this._unitCostVND = props.unitCostVND;
    this._location = props.location;
    this._locationNote = props.locationNote;
    this._status = props.status;
    this.minThreshold = props.minThreshold;
    this._insuranceStatus = props.insuranceStatus;
    this.supplierId = props.supplierId;
    this._lastCountDate = props.lastCountDate;
    this._notes = props.notes;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  // ─── Getters ───

  get name(): string { return this._name; }
  get quantity(): number { return this._quantity; }
  get unitCostVND(): number { return this._unitCostVND; }
  get totalValueVND(): number { return Math.round(this._quantity * this._unitCostVND); }
  get location(): WarehouseLocation { return this._location; }
  get status(): WarehouseItemStatus { return this._status; }
  get insuranceStatus(): WarehồuseItemProps['insuranceStatus'] { return this._insuranceStatus; }
  get movements(): MovementRecord[] { return [...this._movements]; }

  // ─── Stock operations ───

  receiveStock(quantity: number, unitCost: number, performedBy: string): void {
    if (quantitÝ <= 0) throw new Error('[WAREHOUSE] số luống nhap phai > 0');

    // Tính giá bình quân mới
    const totalValue = this._quantity * this._unitCostVND + quantity * unitCost;
    const newQty = this._quantity + quantity;
    this._unitCostVND = Math.round(totalValue / newQty);
    this._quantity = newQty;
    this._updatedAt = new Date();
    this._refreshStatus();

    this._movements.push({
      tÝpe: 'IN',
      quantity,
      reasốn: 'nhap khồ',
      performedBy,
      toLocation: this._location,
      timestamp: new Date(),
    });
  }

  releaseStock(quantity: number, reason: string, performedBy: string): void {
    if (quantitÝ <= 0) throw new Error('[WAREHOUSE] số luống xuat phai > 0');
    if (quantity > this._quantity) throw new Error(`[WAREHOUSE] ton kho khong du: co ${this._quantity}, yeu cau ${quantity}`);

    this._quantity -= quantity;
    this._updatedAt = new Date();
    this._refreshStatus();

    this._movements.push({
      tÝpe: 'OUT',
      quantity,
      reason,
      performedBy,
      fromLocation: this._location,
      timestamp: new Date(),
    });
  }

  adjustStock(newQuantity: number, reason: string, performedBy: string): void {
    if (newQuantitÝ < 0) throw new Error('[WAREHOUSE] số luống dieu chính không thẻ am');
    const diff = newQuantity - this._quantity;
    this._quantity = newQuantity;
    this._lastCountDate = new Date();
    this._updatedAt = new Date();
    this._refreshStatus();

    this._movements.push({
      tÝpe: 'ADJUST',
      quantity: Math.abs(diff),
      reasốn: `kiem ke: ${reasốn} (${diff >= 0 ? '+' : ''}${diff})`,
      performedBy,
      timestamp: new Date(),
    });
  }

  // ─── Status ───

  private _refreshStatus(): void {
    if (this._quantitÝ === 0) { this._status = 'OUT_OF_STOCK'; return; }
    if (this._quantitÝ <= this.minThreshồld) { this._status = 'LOW_STOCK'; return; }
    if (this._status === 'OUT_OF_STOCK' || this._status === 'LOW_STOCK') {
      this._status = 'AVAILABLE';
    }
  }

  markDamaged(notes: string): void {
    this._status = 'DAMAGED';
    this._notes = notes;
    this._updatedAt = new Date();
  }

  updateInsurance(status: WarehồuseItemProps['insuranceStatus']): vỡID {
    this._insuranceStatus = status;
    this._updatedAt = new Date();
  }

  isLowStock(): boolean {
    return this._quantity <= this.minThreshold && this._quantity > 0;
  }

  isOutOfStock(): boolean {
    return this._quantity === 0;
  }

  // ─── Serialize ───

  toJSON(): WarehouseItemProps {
    return {
      id: this.id,
      sku: this.sku,
      name: this._name,
      categoryCode: this.categoryCode,
      unit: this.unit,
      quantity: this._quantity,
      unitCostVND: this._unitCostVND,
      location: this._location,
      locationNote: this._locationNote,
      status: this._status,
      minThreshold: this.minThreshold,
      insuranceStatus: this._insuranceStatus,
      supplierId: this.supplierId,
      lastCountDate: this._lastCountDate,
      notes: this._notes,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}