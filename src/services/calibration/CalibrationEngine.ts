// CalibrationEngine for threat-detection
export class Calibration {
  private static thresholds: Map<string, number> = new Map([
    ['TRAFFIC_ANOMALY', 0.7],
    ['BRUTE_FORCE', 0.85],
    ['DATA_EXFIL', 0.9],
    ['DEFAULT', 0.75],
  ]);

  static getThreshold(threatType: string): number {
    return this.thresholds.get(threatType) || this.thresholds.get('DEFAULT')!;
  }

  static calibrate(threatType: string, threshold: number): void {
    this.thresholds.set(threatType, Math.min(1, Math.max(0, threshold)));
  }

  static calculateAdaptiveThreshold(actor: string, intensity: number): number {
    const base = this.thresholds.get('DEFAULT') || 0.75;
    const adjusted = base - (intensity * 0.05);
    return Math.min(0.95, Math.max(0.3, adjusted));
  }
}
