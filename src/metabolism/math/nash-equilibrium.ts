// @ts-nocheck
/**
 * nash-equilibrium.ts
 * Quantum Defense dùng để đánh giá tính ổn định của chiến lược phản ứng
 */
export class NashEquilibrium {
  /**
   * Kiểm tra xem một mixed strategy có phải Nash Equilibrium không
   * @param payoffMatrix  ma trận payoff [player1][player2]
   * @param mixedStrategy xác suất chọn từng action
   */
  isNash(payoffMatrix: number[][], mixedStrategy: number[]): boolean {
    const n = mixedStrategy.length;
    const expectedPayoff = this.expectedPayoff(payoffMatrix, mixedStrategy);
    for (let i = 0; i < n; i++) {
      const purePayoff = payoffMatrix[i].reduce(
        (s, v, j) => s + v * mixedStrategy[j], 0
      );
      if (purePayoff > expectedPayoff + 1e-9) return false;
    }
    return true;
  }

  expectedPayoff(payoffMatrix: number[][], strategy: number[]): number {
    let total = 0;
    for (let i = 0; i < strategy.length; i++) {
      for (let j = 0; j < strategy.length; j++) {
        total += strategy[i] * strategy[j] * (payoffMatrix[i]?.[j] ?? 0);
      }
    }
    return total;
  }

  /**
   * Kiểm tra ESS (Evolutionarily Stable Strategy)
   * Strategy x* là ESS nếu không bị xâm lấn bởi mutant y
   */
  isESS(payoffMatrix: number[][], strategy: number[], mutant: number[]): boolean {
    const xVsX = this.expectedPayoff(payoffMatrix, strategy);
    const yVsX = this.mixedVsFixed(payoffMatrix, mutant, strategy);
    const xVsY = this.mixedVsFixed(payoffMatrix, strategy, mutant);
    const yVsY = this.expectedPayoff(payoffMatrix, mutant);
    if (xVsX > yVsX) return true;
    if (Math.abs(xVsX - yVsX) < 1e-9 && xVsY > yVsY) return true;
    return false;
  }

  private mixedVsFixed(matrix: number[][], row: number[], col: number[]): number {
    let total = 0;
    for (let i = 0; i < row.length; i++) {
      for (let j = 0; j < col.length; j++) {
        total += row[i] * col[j] * (matrix[i]?.[j] ?? 0);
      }
    }
    return total;
  }
}
