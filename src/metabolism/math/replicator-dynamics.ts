// @ts-nocheck
/**
 * replicator-dynamics.ts
 * QNEU dùng để cập nhật tần suất pattern theo fitness thực tế
 * Phương trình: ẋᵢ = xᵢ(fᵢ - f̄)
 */
export class ReplicatorDynamics {
  /**
   * Cập nhật tần suất một bước
   * @param frequencies xᵢ — tần suất hiện tại của từng pattern (tổng = 1)
   * @param fitness     fᵢ — độ thích nghi của từng pattern
   * @param dt          bước thời gian (mặc định 1)
   */
  update(frequencies: number[], fitness: number[], dt = 1): number[] {
    if (frequencies.length !== fitness.length) throw new Error('Dimension mismatch');
    const fBar = fitness.reduce((s, f, i) => s + f * frequencies[i], 0); // f̄ trung bình
    const updated = frequencies.map((x, i) => x + x * (fitness[i] - fBar) * dt);
    const total = updated.reduce((s, v) => s + v, 0);
    return updated.map(v => v / total); // normalize lại tổng = 1
  }

  /**
   * Chạy nhiều bước đến khi hội tụ
   */
  converge(frequencies: number[], fitness: number[], maxIter = 100, tol = 1e-6): number[] {
    let x = [...frequencies];
    for (let i = 0; i < maxIter; i++) {
      const next = this.update(x, fitness);
      const diff = next.reduce((s, v, j) => s + Math.abs(v - x[j]), 0);
      x = next;
      if (diff < tol) break;
    }
    return x;
  }
}
