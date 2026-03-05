// NotifyBus — notification service shim for module integration
export interface NotifyMessage {
  type: 'RISK' | 'SUCCESS' | 'WARNING' | 'INFO' | 'NEWS';
  title: string;
  content: string;
  persona?: string;
  priority?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private queue: NotifyMessage[] = [];

  static getInstance(): NotificationService {
    if (!NotificationService.instance) NotificationService.instance = new NotificationService();
    return NotificationService.instance;
  }

  push(msg: NotifyMessage): void {
    this.queue.push({ ...msg, persona: msg.persona || 'SYSTEM' });
    console.log(`[NOTIFY:${msg.type}] ${msg.title}: ${msg.content}`);
  }

  getQueue(): NotifyMessage[] { return [...this.queue]; }
  clear(): void { this.queue = []; }
}

export const NotifyBus = NotificationService.getInstance();
export default NotificationService;
