/** Shim: QuantumBuffer with static methods */
export class QuantumBuffer {
  static subscribe(): { unsubscribe: () => void } {
    return { unsubscribe: () => {} };
  }
  static async flush(): Promise<void> {}
  static async enqueue(item: unknown): Promise<void> {}
}
