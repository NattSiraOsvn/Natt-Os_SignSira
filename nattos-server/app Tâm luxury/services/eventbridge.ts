
import { NotifyBus } from './notificationService';
import { ShardingService } from './blockchainService';
import { QuantumBrain } from './quantumEngine'; // Import Brain
import { PersonaID } from '../types';

/**
 * SYSTEM EVENT BRIDGE (ESB - Enterprise Service Bus)
 * Trục xương sống kết nối các module rời rạc: Sales <-> Inventory <-> Archive
 * Giúp SystemNavigator hiển thị trạng thái thực tế.
 */

export type SystemEvent = 
  | 'SALES_ORDER_created' 
  | 'INVENTORY_CHECKED' 
  | 'PRODUCTION_STARTED' 
  | 'LOGISTICS_DISpatched' 
  | 'FINANCE_PAID' 
  | 'ARCHIVE_SEALED';

type EventHandler = (data: Record<string, unknown>) => void;

class SystemEventBridgeService {
  private static instance: SystemEventBridgeService;
  private handlers: Map<string, EventHandler[]> = new Map();

  public static getInstance(): SystemEventBridgeService {
    if (!SystemEventBridgeService.instance) {
      SystemEventBridgeService.instance = new SystemEventBridgeService();
    }
    return SystemEventBridgeService.instance;
  }

  // Đăng ký lắng nghe sự kiện
  public subscribe(eventType: SystemEvent | string, handler: EventHandler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)?.push(handler);
    return () => this.unsubscribe(eventType, handler);
  }

  public unsubscribe(eventType: string, handler: EventHandler) {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      this.handlers.set(eventType, handlers.filter(h => h !== handler));
    }
  }

  // Phát sự kiện (Publish)
  public async publish(eventType: SystemEvent | string, data: unknown) {
    console.log(`[EVENT-BRIDGE] 📡 Broadcasting: ${eventType}`, data);
    
    // 1. Log to Blockchain Audit (Giả lập băm hash sự kiện quan trọng)
    if (eventType.includes('created') || eventType.includes('PAID') || eventType.includes('SEALED')) {
        const hash = ShardingService.generateShardHash({ type: eventType, data, ts: Date.now() });
        // Trong thực tế sẽ lưu hash này vào AuditLog
    }

    // 2. Feed to QUANTUM BRAIN (Hệ thần kinh)
    QuantumBrain.processEvent(eventType, data);
    
    // 3. Dispatch to handlers
    const handlers = this.handlers.get(eventType) || [];
    handlers.forEach(h => h(data));

    // 4. System Notification Trigger (Nếu cần)
    if (eventType === 'ARCHIVE_SEALED') {
       NotifyBus.push({
         type: 'SUCCESS',
         title: 'Niêm phong Dữ liệu',
         content: `Dữ liệu năm tài chính đã được đóng băng. Hash: ${data.merkleRoot?.substring(0,10)}...`,
         persona: PersonaID.THIEN
       });
    }
  }
}

export const EventBridge = SystemEventBridgeService.getInstance();
