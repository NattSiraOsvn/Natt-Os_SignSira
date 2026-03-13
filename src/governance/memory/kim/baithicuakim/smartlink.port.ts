// @ts-nocheck
import { EventBus } from '../../../core/event-bus';
import { createEnvelope } from '../../../shared-kernel/event-envelope';

export class NeuralMainPort {
  constructor(private eventBus: EventBus, private cellId: string) {}

  async request(service: string, method: string, payload: any): Promise<any> {
    // Gửi event và chờ response (cần cơ chế correlationId)
    const envelope = createEnvelope(
      'system',
      `neural-main.${service}.${method}`,
      payload
    );
    this.eventBus.emit(envelope);
    // Trong prototype, giả sử có response riêng
    return new Promise((resolve) => {
      const handler = (response: any) => {
        if (response.causationId === envelope.event_id) {
          this.eventBus.unsubscribe('neural-main.response', handler);
          resolve(response.payload);
        }
      };
      this.eventBus.subscribe('neural-main.response', handler);
    });
  }
}