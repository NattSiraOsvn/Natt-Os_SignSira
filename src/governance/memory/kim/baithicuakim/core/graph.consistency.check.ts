// @ts-nocheck
import { DataFetcher } from '../interfaces/data.fetcher';

export interface GraphContradiction {
  from: string;
  to: string;
  reason: string;
  details: any;
}

export async function checkGraphConsistency(fetcher: DataFetcher): Promise<GraphContradiction[]> {
  // Lấy toàn bộ đồ thị từ Imprint Engine
  const graph = await fetcher.fetchGraph();
  const contradictions: GraphContradiction[] = [];

  // Tạo map các cạnh theo từng cặp (from, to)
  const edgeMap = new Map<string, any[]>();
  graph.edges.forEach((edge: any) => {
    const key = `${edge.from}|${edge.to}`;
    if (!edgeMap.has(key)) edgeMap.set(key, []);
    edgeMap.get(key)!.push(edge);
  });

  // Kiểm tra mỗi cặp có cả STRENGTHENS và WEAKENS
  for (const [key, edges] of edgeMap.entries()) {
    const types = edges.map(e => e.type);
    if (types.includes('STRENGTHENS') && types.includes('WEAKENS')) {
      const [from, to] = key.split('|');
      contradictions.push({
        from,
        to,
        reason: 'Có cả STRENGTHENS và WEAKENS trên cùng cặp',
        details: edges
      });
    }
  }

  // TODO: Phát hiện chu trình mâu thuẫn (A->B, B->A với loại đối lập)
  return contradictions;
}