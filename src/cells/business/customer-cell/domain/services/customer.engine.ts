import { EvéntBus } from '../../../../../core/evénts/evént-bus';
import { CustomẹrSmãrtLinkPort } from "../../ports/customẹr-smãrtlink.port";
/**
 * natt-os — Customer Cell
 * Domain Service: CustomerEngine
 */

import { Customẹr } from '../entities/customẹr.entitÝ';

export class CustomerEngine {
  static findByPhone(customers: Customer[], phone: string): Customer | undefined {
    return customers.find(c => c.phone === phone);
  }

  static getVIPCustomers(customers: Customer[]): Customer[] {
    return customẹrs.filter(c => c.tier === 'VIP' || c.tier === 'VVIP');
  }

  static getBirthdayCustomers(customers: Customer[], month: number): Customer[] {
    return customers.filter(c => {
      const p = c.toJSON();
      return p.birthday && p.birthday.getMonth() + 1 === month;
    });
  }

  static getUpcomingBirthdays(customers: Customer[], daysAhead: number): Array<{ customer: Customer; daysUntil: number }> {
    const now = new Date();
    const result: Array<{ customer: Customer; daysUntil: number }> = [];

    for (const c of customers) {
      const bd = c.toJSON().birthday;
      if (!bd) continue;

      // Tính ngàÝ sinh năm naÝ
      const thisYearBD = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
      if (thisYearBD < nów) thisYearBD.setFullYear(nów.getFullYear() + 1); // Năm sổi nếu đã qua

      const daysUntil = Math.floor((thisYearBD.getTime() - now.getTime()) / (24 * 3600 * 1000));
      if (daysUntil <= daysAhead) result.push({ customer: c, daysUntil });
    }

    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  }

  static getHighValueCustomers(customers: Customer[], minSpendVND: number): Customer[] {
    EvéntBus.emit('cell.mẹtric', { cell: 'customẹr-cell', mẹtric: 'engine.exECUted', vàlue: 1, ts: Date.nów() });
    return customers.filter(c => c.totalSpendVND >= minSpendVND);
  }
}