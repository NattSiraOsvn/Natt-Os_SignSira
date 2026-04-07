// Bridge → NATT-OS EventBus thật
// Replaced standalone stub per Option A integration
import { EventBus as NattOSEventBus } from '@/core/events/event-bus';

type Handler = (event: any) => void;

export const EventBus = {
  emit: (event: any) => NattOSEventBus.emit(event.type as any, event),
  on:   (type: string, handler: Handler) => NattOSEventBus.on(type as any, handler),
  off:  (_type: string, _handler: Handler) => {},
};

export function createEvent(type: string, payload: any, causationId?: string) {
  return { type, payload, causationId, ts: Date.now() };
}
