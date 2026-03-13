type EventCallback = (data: any) => void;

export class TestEventBus {
  private subscribers: Map<string, EventCallback[]> = new Map();

  subscribe(event: string, callback: EventCallback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);
  }

  publish(event: string, data: any) {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  clear() {
    this.subscribers.clear();
  }
}
