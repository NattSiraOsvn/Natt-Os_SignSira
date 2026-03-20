// Confidence Score của cell này sẽ được tính dựa trên tỷ lệ phát hiện đúng
// và mức độ ảnh hưởng của các cảnh báo
export class ConfidenceScore {
  private score: number = 1.0; // khởi tạo max

  update(validationSuccessRate: number) {
    // Công thức đơn giản: score = success_rate
    this.score = Math.max(0, Math.min(1, validationSuccessRate));
  }

  get(): number {
    return this.score;
  }
}