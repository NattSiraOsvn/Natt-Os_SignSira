// NATT-OS EventBridge
type Handler = (...args: unknown[]) => void;
const listeners: Record<string, Handler[]> = {};
export const EventBridge = {
  on:          (e: string, h: Handler): void => { (listeners[e] ??= []).push(h); },
  subscribe:   (e: string, h: Handler): void => { (listeners[e] ??= []).push(h); },
  emit:        (e: string, ...a: unknown[]): void => { (listeners[e] ?? []).forEach(h => h(...a)); },
  publish:     (e: string, ...a: unknown[]): void => { (listeners[e] ?? []).forEach(h => h(...a)); },
  off:         (e: string, h: Handler): void => { listeners[e] = (listeners[e] ?? []).filter(x => x !== h); },
  unsubscribe: (e: string, h: Handler): void => { listeners[e] = (listeners[e] ?? []).filter(x => x !== h); },
};
export default EventBridge;
