// STUB - typed wrapper for event-bus
export * from './event-bus';

export const typedEmit = (...args: any[]) => (bus as any).emit(...args);
