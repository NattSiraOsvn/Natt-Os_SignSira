import { EventBus } from "@/core/events/event-bus";

export class PeriodCloseGuard {
    async canClose(period: string): Promise<{ allowed: boolean; reasons: string[] }> {
        const reasons: string[] = [];
        // Kiểm tra xem còn bụi chưa xử lý không (giả lập)
        const dustPending = false; // Thay bằng logic thực tế
        if (dustPending) reasons.push("Dust not processed");
        // Kiểm tra alert chưa giải quyết
        const openAlerts = false; // Thay bằng logic
        if (openAlerts) reasons.push("Unresolved fraud alerts");
        return { allowed: reasons.length === 0, reasons };
    }
}
export const periodCloseGuard = new PeriodCloseGuard();
