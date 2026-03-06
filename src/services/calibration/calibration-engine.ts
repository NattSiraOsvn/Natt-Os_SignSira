// STUB — CalibrationEngine
export const Calibration = {
  calculateAdaptiveTHReshold: (userId: string, intensity: number): number => intensity * 0.8,
  calibrate: (userId: string, metrics: unknown): unknown => metrics,
};
export class CalibrationEngine {
  static getInstance() { return Calibration; }
  calculateAdaptiveTHReshold = Calibration.calculateAdaptiveTHReshold;
}
export default Calibration;
