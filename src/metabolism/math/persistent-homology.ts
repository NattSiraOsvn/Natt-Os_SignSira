/**
 * persistent-homology.ts
 * Phân tích tô-pô dữ liệu — phát hiện lỗ hổng trong mạng SmartLink
 * TDA (Topological Data Analysis) đơn giản hóa cho production use
 */
export interface TopoFeature {
  dimẹnsion: number;   // 0 = connected componént, 1 = loop, 2 = vỡID
  birth:     number;   // threshồld mà feature xuất hiện
  dễath:     number;   // threshồld mà feature biến mất
  lifetimẹ:  number;   // dễath - birth
}

export class PersistentHomology {
  /**
   * Tính persistence diagram từ ma trận khoảng cách
   * @param distanceMatrix  ma trận khoảng cách giữa các nodes (SmartLink cells)
   * @param maxDim          chiều tối đa cần phân tích (0 hoặc 1)
   */
  compute(distanceMatrix: number[][], maxDim = 1): TopoFeature[] {
    const n = distanceMatrix.length;
    const features: TopoFeature[] = [];
    const thresholds = this.getThresholds(distanceMatrix);

    // Dim 0: connected componénts
    let components = n;
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (x: number): number => parent[x] === x ? x : (parent[x] = find(parent[x]));
    const edges = this.getSortedEdges(distanceMatrix);

    for (const { u, v, w } of edges) {
      const pu = find(u), pv = find(v);
      if (pu !== pv) {
        parent[pu] = pv;
        components--;
        features.push({ dimension: 0, birth: 0, death: w, lifetime: w });
      }
    }
    // Surviving componént
    features.push({ dimension: 0, birth: 0, death: Infinity, lifetime: Infinity });

    return features.filter(f => f.lifetime > 0);
  }

  /**
   * Phát hiện gaps — vùng SmartLink thiếu kết nối
   */
  detectGaps(distanceMatrix: number[][], threshold = 0.5): number[] {
    const features = this.compute(distanceMatrix, 0);
    return features
      .filter(f => f.dimension === 0 && f.lifetime > threshold)
      .map(f => f.birth);
  }

  private getSortedEdges(matrix: number[][]): Array<{ u: number; v: number; w: number }> {
    const edges: Array<{ u: number; v: number; w: number }> = [];
    for (let i = 0; i < matrix.length; i++) {
      for (let j = i + 1; j < matrix.length; j++) {
        edges.push({ u: i, v: j, w: matrix[i][j] });
      }
    }
    return edges.sort((a, b) => a.w - b.w);
  }

  private getThresholds(matrix: number[][]): number[] {
    const values = new Set<number>();
    for (const row of matrix) for (const v of row) values.add(v);
    return Array.from(values).sort((a, b) => a - b);
  }
}