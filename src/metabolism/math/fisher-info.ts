// @ts-nocheck
/**
 * fisher-info.ts
 * Đo độ nhạy cảm của chỉ số (coherence/entropy) với thay đổi hệ thống
 * Fisher information cao → chỉ số đó là dấu hiệu tốt để cảnh báo sớm
 */
export class FisherInformation {
  /**
   * Tính Fisher information từ phân phối xác suất p(x|θ)
   * Dùng xấp xỉ số học từ dữ liệu thực
   * @param observations  mảng quan sát
   * @param delta         bước perturbation
   */
  compute(observations: number[], delta = 0.01): number {
    if (observations.length < 3) return 0;
    const mean = observations.reduce((s, v) => s + v, 0) / observations.length;
    const variance = observations.reduce((s, v) => s + (v - mean) ** 2, 0) / observations.length;
    if (variance === 0) return 0;
    // Với Gaussian: Fisher information = 1/variance
    return 1 / variance;
  }

  /**
   * So sánh Fisher information của nhiều metrics
   * Metric nào có Fisher information cao nhất → nhạy cảm nhất
   */
  rankSensitivity(metricsData: Record<string, number[]>): string[] {
    const scores = Object.entries(metricsData).map(([name, data]) => ({
      name,
      fisher: this.compute(data),
    }));
    return scores.sort((a, b) => b.fisher - a.fisher).map(s => s.name);
  }
}
