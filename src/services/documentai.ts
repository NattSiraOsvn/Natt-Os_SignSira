/** Shim: DocumentAI service */
export interface AIScoringConfig { model: string; threshold: number; }
export interface DetectedContext { type: string; confidence: number; data: unknown; }

export class Utilities {
  static async score(input: unknown, config: AIScoringConfig): Promise<number> { return 0; }
  static async detect(input: unknown): Promise<DetectedContext[]> { return []; }
}
