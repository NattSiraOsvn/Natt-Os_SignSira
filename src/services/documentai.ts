/** Shim: DocumentAI service */
export interface AIScoringConfig {
  model: string;
  threshold: number;
  keywords: Record<string, string[]>;
}
export type DetectedContext = string;

class DocumentAIClient {
  getConfig(): AIScoringConfig {
    return { model: 'default', threshold: 0.5, keywords: {} };
  }
  updateConfig(config: AIScoringConfig): void {}
}

export class Utilities {
  static documentAI = new DocumentAIClient();
  static async score(input: unknown, config: AIScoringConfig): Promise<number> { return 0; }
  static async detect(input: unknown): Promise<DetectedContext[]> { return []; }
}
