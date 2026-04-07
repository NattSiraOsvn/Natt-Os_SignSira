
import { NotifyBus, AlertType } from './notificationService';
import { PersonaID } from '../types';

export class RealTimeNotificationService {
  private static instance: RealTimeNotificationService;
  private isConnected: boolean = false;
  private intervalId: unknown;

  static getInstance() {
    if (!RealTimeNotificationService.instance) {
      RealTimeNotificationService.instance = new RealTimeNotificationService();
    }
    return RealTimeNotificationService.instance;
  }

  /**
   * Simulate establishing a WebSocket or SSE connection.
   */
  connect() {
    if (this.isConnected) return;
    
    console.log('[RealTime] Initializing Secure Stream (WSS)...');
    
    // Simulate network handshake
    setTimeout(() => {
      this.isConnected = true;
      console.log('[RealTime] Connected to Natt-OS Event Stream.');
      
      // Announce connection
      NotifyBus.push({
        type: 'SUCCESS',
        title: 'Neural Stream Active',
        content: 'Connected to real-time enterprise event bus.',
        priority: 'LOW',
        persona: PersonaID.PHIEU
      });

      this.startListening();
    }, 1200);
  }

  /**
   * Close connection
   */
  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isConnected = false;
    console.log('[RealTime] Stream Disconnected.');
  }

  private startListening() {
    // Simulate random incoming events from the "Server"
    this.intervalId = setInterval(() => {
      // 25% chance to receive an event every 10 seconds to avoid spamming the UI
      if (Math.random() > 0.75) {
        this.dispatchMockEvent();
      }
    }, 10000);
  }

  private dispatchMockEvent() {
    const events: { type: AlertType, title: string, content: string, priority: 'HIGH' | 'MEDIUM' | 'LOW', persona: PersonaID }[] = [
      {
        type: 'RISK',
        title: 'Inventory Alert',
        content: 'Discrepancy detected in Gold 18K stock level at HCM Branch. Manual review recommended.',
        priority: 'HIGH',
        persona: PersonaID.KRIS
      },
      {
        type: 'ORDER',
        title: 'Order Completed',
        content: `Order #SO-${Math.floor(Math.random() * 9000) + 1000} has been delivered and payment confirmed.`,
        priority: 'MEDIUM',
        persona: PersonaID.CAN
      },
      {
        type: 'NEWS',
        title: 'Compliance Update',
        content: 'New tax regulations for luxury goods effective next month. System updated.',
        priority: 'MEDIUM',
        persona: PersonaID.THIEN
      },
      {
        type: 'ORDER',
        title: 'High Value Request',
        content: 'New RFQ for Custom Diamond Ring received. Value estimate > 500M VND.',
        priority: 'HIGH',
        persona: PersonaID.CAN
      },
      {
        type: 'SUCCESS',
        title: 'Backup Finished',
        content: 'Daily ledger backup completed successfully. Integrity verified.',
        priority: 'LOW',
        persona: PersonaID.PHIEU
      }
    ];

    const randomEvent = events[Math.floor(Math.random() * events.length)];

    NotifyBus.push({
      type: randomEvent.type,
      title: randomEvent.title,
      content: randomEvent.content,
      priority: randomEvent.priority,
      persona: randomEvent.persona,
      metadata: {
        source: 'REAL_TIME_ENGINE',
        timestamp: Date.now()
      }
    });
  }
}

export const RealTimeService = RealTimeNotificationService.getInstance();
