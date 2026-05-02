/** Shim: SmartLinkClient with static methods */
export class SmartLinkClient {
  static createEnvelope(cell: string, action: string, payload: unknown): unknown {
    return { cell, action, payload, id: Date.now().toString(36) };
  }
  static async send(envelope: unknown): Promise<unknown> { return {}; }
  static async resolve(params: Record<string, unknown>): Promise<unknown> { return {}; }
}