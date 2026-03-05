/** Shim: CustomsRobotEngine */
export interface CustomsResult {
  actionPlans: Array<{ priority: string; action: string }>;
}

export class CustomsRobotEngine {
  static async batchProcess(files: unknown[]): Promise<CustomsResult[]> {
    return files.map(() => ({ actionPlans: [] }));
  }
  static async processDeclaration(params: Record<string, unknown>): Promise<unknown> { return {}; }
}
