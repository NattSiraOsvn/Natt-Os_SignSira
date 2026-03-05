/** Shim: ConflictEngine with static methods */
export class ConflictEngine {
  static async resolveConflicts(items: unknown[], options: Record<string, unknown>): Promise<unknown> {
    return { resolved: true };
  }
  static async resolve(params: Record<string, unknown>): Promise<unknown> { return {}; }
}
