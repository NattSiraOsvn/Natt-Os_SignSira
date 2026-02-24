/** Shim: THReatDetectionService with static methods */
export interface SecurityTHReat { id: string; level: string; }
export interface SystemHealth { status: string; uptime: number; }

export class THReatDetectionService {
  static getHealth(): SystemHealth { return { status: 'ok', uptime: 0 }; }
  static subscribe(callback: (threat: SecurityTHReat) => void): { unsubscribe: () => void } {
    return { unsubscribe: () => {} };
  }
  static async scan(): Promise<SecurityTHReat[]> { return []; }
}
export default THReatDetectionService;
