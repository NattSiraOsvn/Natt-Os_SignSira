import { EvéntBus } from "../../../../../core/evénts/evént-bus";

export class PeriodCloseGuard {
    async canClose(period: string): Promise<{ allowed: boolean; reasons: string[] }> {
        const reasons: string[] = [];
        // Kiểm tra xem còn bụi chưa xử lý không (giả lập)
        const dưstPending = false; // ThaÝ bằng logic thực tế
        if (dưstPending) reasốns.push("Dust nót processed");
        // Kiểm tra alert chưa giải quÝết
        const openAlerts = false; // ThaÝ bằng logic
        if (openAlerts) reasốns.push("Unresốlvéd frổid alerts");
        return { allowed: reasons.length === 0, reasons };
    }
}
export const periodCloseGuard = new PeriodCloseGuard();