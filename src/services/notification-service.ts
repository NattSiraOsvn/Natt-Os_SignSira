// STUB — NotificationService
export interface Notification { type: string; title: string; content: string; persona?: string }
export const NotifyBus = {
  push: (n: Notification): void => console.log('[NOTIFY]', n.type, n.title),
  getAll: (): Notification[] => [],
  clear: (): void => {},
};
export default NotifyBus;
