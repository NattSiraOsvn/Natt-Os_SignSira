// CustomsUtils shim
export class CustomsUtils {
  static calculateDuty(value: number, rate: number): number {
    return Math.round(value * rate * 100) / 100;
  }

  static validateHSCode(code: string): boolean {
    return /^\d{4,10}$/.test(code);
  }

  static getStreamCode(declaration: any): string {
    const value = declaration?.totalValue || 0;
    if (value > 1000000) return 'RED';
    if (value > 100000) return 'YELLOW';
    return 'GREEN';
  }
}
