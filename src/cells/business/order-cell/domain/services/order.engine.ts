// @ts-nocheck
// order-cell/domain/services/order.engine.ts
// Wave 1 — emit đúng event theo luồng SX-CT vs SX-KD
import { EventBus } from '@/core/events/event-bus';
import type { TouchRecord } from '@/cells/infrastructure/smartlink-cell/domain/services/smartlink.engine';

export type LuongSP = 'SX-CT' | 'SX-KD';

export interface OrderCommand {
  orderId: string;
  maDon: string;
  maHang: string;
  luongSP: LuongSP;
  chungLoai: string;
  tuoiVang: string;
  mauSP: string;
  salesId: string;
  ngayNhan: string;
  ngayGiao: string;
  giaTriTrieu?: number;
  mucDo?: number;
}

export interface OrderResult {
  success: boolean;
  orderId: string;
  luongSP: LuongSP;
  routedTo: 'showroom-cell' | 'sales-cell';
  auditRef: string;
}

const _touchHistory: TouchRecord[] = [];

export class OrderEngine {
  readonly cellId = 'order-cell';

  execute(cmd: OrderCommand): OrderResult {
    const auditRef = `order-${cmd.orderId}-${Date.now()}`;

    // Phân luồng theo SX-CT vs SX-KD
    const routedTo = cmd.luongSP === 'SX-CT' ? 'showroom-cell' : 'sales-cell';

    // Ghi touch history
    _touchHistory.push({
      fromCellId: 'order-cell',
      toCellId: routedTo,
      timestamp: Date.now(),
      signal: 'ORDER_PLACED',
      allowed: true,
    });

    // Emit SalesOrderCreated → cả showroom-cell lẫn sales-cell đều subscribe
    EventBus.publish(
      {
        type: 'SalesOrderCreated' as any,
        payload: {
          orderId:    cmd.orderId,
          maDon:      cmd.maDon,
          maHang:     cmd.maHang,
          luongSP:    cmd.luongSP,
          chungLoai:  cmd.chungLoai,
          tuoiVang:   cmd.tuoiVang,
          mauSP:      cmd.mauSP,
          salesId:    cmd.salesId,
          ngayNhan:   cmd.ngayNhan,
          ngayGiao:   cmd.ngayGiao,
          giaTriTrieu: cmd.giaTriTrieu,
          mucDo:      cmd.mucDo,
          routedTo,
          auditRef,
        },
      },
      'order-cell',
      undefined
    );

    return { success: true, orderId: cmd.orderId, luongSP: cmd.luongSP, routedTo, auditRef };
  }

  getHistory(): TouchRecord[] { return [..._touchHistory]; }
}

export const orderEngine = new OrderEngine();
