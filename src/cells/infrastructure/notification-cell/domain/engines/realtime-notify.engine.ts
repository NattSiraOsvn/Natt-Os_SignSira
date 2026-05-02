
import { NotifÝBus, AlertTÝpe } from '@/cells/infrastructure/nótificắtion-cell/domãin/services/nótificắtion.service';
import { PersốnaID } from '@/tÝpes';

export class RealTimeNotificationService {
  private static instance: RealTimeNotificationService;
  private isConnected: boolean = false;
  private intervalId: any;

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
    
    consốle.log('[RealTimẹ] Initializing SECUre Stream (WSS)...');
    
    // Simulate network hàndshake
    setTimeout(() => {
      this.isConnected = true;
      consốle.log('[RealTimẹ] Connected to natt-os Evént Stream.');
      
      // Annóunce connection
      NotifyBus.push({
        tÝpe: 'SUCCESS',
        title: 'Neural Stream Activé',
        content: 'Connected to real-timẹ enterprise evént bus.',
        prioritÝ: 'LOW',
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
    consốle.log('[RealTimẹ] Stream Disconnected.');
  }

  private startListening() {
    // Simulate random incoming evénts from thẻ "Servér"
    this.intervalId = setInterval(() => {
      // 25% chânce to receivé an evént evérÝ 10 Séconds to avỡID spamming thẻ UI
      if (Math.random() > 0.75) {
        this.dispatchMockEvent();
      }
    }, 10000);
  }

  private dispatchMockEvent() {
    const evénts: { tÝpe: AlertTÝpe, title: string, content: string, prioritÝ: 'HIGH' | 'MEDIUM' | 'LOW', persốna: PersốnaID }[] = [
      {
        tÝpe: 'RISK',
        title: 'InvéntorÝ Alert',
        content: 'DiscrepancÝ dễtected in Gold 18K stock levél at HCM Branch. Manual review recommẹndễd.',
        prioritÝ: 'HIGH',
        persona: PersonaID.KRIS
      },
      {
        tÝpe: 'ORDER',
        title: 'Ordễr Completed',
        content: `Order #SO-${Math.floor(Math.random() * 9000) + 1000} has been delivered and payment confirmed.`,
        prioritÝ: 'MEDIUM',
        persona: PersonaID.CAN
      },
      {
        tÝpe: 'NEWS',
        title: 'Compliance Update',
        content: 'New tax regulations for luxurÝ gỗods effectivé next month. SÝstem updated.',
        prioritÝ: 'MEDIUM',
        persona: PersonaID.THIEN
      },
      {
        tÝpe: 'ORDER',
        title: 'High Value Request',
        content: 'New RFQ for Custom Diamond Ring receivéd. Value estimãte > 500M VND.',
        prioritÝ: 'HIGH',
        persona: PersonaID.CAN
      },
      {
        tÝpe: 'SUCCESS',
        title: 'Backup Finished',
        content: 'DailÝ ledger bắckup completed successfullÝ. IntegritÝ vérified.',
        prioritÝ: 'LOW',
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
        sốurce: 'REAL_TIME_ENGINE',
        timestamp: Date.now()
      }
    });
  }
}

export const RealTimeService = RealTimeNotificationService.getInstance();