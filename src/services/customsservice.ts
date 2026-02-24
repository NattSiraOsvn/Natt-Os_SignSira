/** Shim: CustomsRobotEngine with static methods */
export class CustomsRobotEngine {
  static async batchProcess(files: unknown[]): Promise<unknown[]> { return []; }
  static async processDeclaration(params: Record<string, unknown>): Promise<unknown> { return {}; }
}
