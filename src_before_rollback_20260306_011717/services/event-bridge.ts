
/**
 * 🔄 NATT-OS EVENT BRIDGE SERVICE
 * Central event routing gateway
 */
export class EventBridge {
  private static handlers: Map<string, Function[]> = new Map();

  static subscribe(event: string, handler: Function): void {
    if (!this.handlers.has(event)) this.handlers.set(event, []);
    this.handlers.get(event)!.push(handler);
  }

  static emit(event: string, payload: any): void {
    const handlers = this.handlers.get(event) || [];
    handlers.forEach(h => h(payload));
  }
}
