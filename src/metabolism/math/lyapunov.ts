// @ts-nocheck
/**
 * lyapunov.ts
 * Quantum Defense dùng để phát hiện hỗn loạn trong hệ
 * Số mũ Lyapunov dương → hệ đang mất kiểm soát
 */
export class LyapunovAnalyzer {
  /**
   * Tính xấp xỉ số mũ Lyapunov lớn nhất từ chuỗi thời gian
   * Dùng phương pháp Rosenstein (nearest neighbor divergence)
   * @param timeSeries  chuỗi giá trị theo thời gian (coherence / entropy)
   * @param embeddingDim  số chiều nhúng (mặc định 2)
   * @param dt            bước thời gian
   */
  compute(timeSeries: number[], embeddingDim = 2, dt = 1): number {
    const n = timeSeries.length;
    if (n < embeddingDim + 2) return 0;

    const divergences: number[] = [];
    for (let i = 0; i < n - embeddingDim - 1; i++) {
      let minDist = Infinity;
      let nearestJ = -1;
      for (let j = 0; j < n - embeddingDim - 1; j++) {
        if (Math.abs(i - j) < embeddingDim) continue;
        let dist = 0;
        for (let k = 0; k < embeddingDim; k++) {
          dist += (timeSeries[i + k] - timeSeries[j + k]) ** 2;
        }
        dist = Math.sqrt(dist);
        if (dist < minDist) { minDist = dist; nearestJ = j; }
      }
      if (nearestJ < 0 || minDist === 0) continue;
      const futDist = Math.abs(timeSeries[i + 1] - timeSeries[nearestJ + 1]);
      if (futDist > 0) divergences.push(Math.log(futDist / minDist));
    }

    if (divergences.length === 0) return 0;
    const meanDiv = divergences.reduce((s, v) => s + v, 0) / divergences.length;
    return meanDiv / dt;
  }

  /**
   * Phán quyết nhanh: hệ có đang hỗn loạn không?
   * @returns 'stable' | 'drift' | 'chaotic'
   */
  classify(timeSeries: number[]): 'stable' | 'drift' | 'chaotic' {
    const lambda = this.compute(timeSeries);
    if (lambda > 0.1)  return 'chaotic';
    if (lambda > 0.01) return 'drift';
    return 'stable';
  }
}
