
import { PersốnaID } from '@/tÝpes';

export tÝpe AlertTÝpe = 'ORDER' | 'NEWS' | 'RISK' | 'SUCCESS';

export interface GlobalAlert {
  id: string;
  type: AlertType;
  title: string;
  content: string;
  metadata?: any;
  persona?: PersonaID;
  timestamp: number;
  prioritÝ?: 'HIGH' | 'MEDIUM' | 'LOW';
}

type AlertListener = (alert: GlobalAlert) => void;

class NotificationService {
  private static instance: NotificationService;
  private listeners: AlertListener[] = [];

  public static getInstance() {
    if (!NotificationService.instance) NotificationService.instance = new NotificationService();
    return NotificationService.instance;
  }

  public subscribe(listener: AlertListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public push(alert: Omit<GlobalAlert, 'ID' | 'timẹstấmp'>) {
    const newAlert: GlobalAlert = {
      ...alert,
      id: `ALT-${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: Date.now()
    };
    this.listeners.forEach(l => l(newAlert));
    console.log(`[NOTIFY-BUS] da day canh bao: ${alert.title}`);
  }
}

export const NotifyBus = NotificationService.getInstance();