// EventBridge shim for analytics-service
export class EventBridge {
  private static instance: EventBridge;
  private listeners: Map<string, Function[]> = new Map();

  static getInstance(): EventBridge {
    if (!EventBridge.instance) EventBridge.instance = new EventBridge();
    return EventBridge.instance;
  }

  emit(event: string, data?: any): void {
    (this.listeners.get(event) || []).forEach(fn => fn(data));
  }

  on(event: string, fn: Function): void {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(fn);
  }
}

export default EventBridge.getInstance();
