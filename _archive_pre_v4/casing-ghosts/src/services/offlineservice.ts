/** Shim: OfflineService with static methods */
export class OfflineService {
  static saveData(key: string, data: unknown): void {}
  static async sync(params: Record<string, unknown>): Promise<unknown> { return {}; }
  static async getStatus(): Promise<string> { return 'online'; }
}
