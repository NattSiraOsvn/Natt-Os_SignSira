import { DataFetcher } from '../interfaces/data.fetcher';

export interface Blindspot {
  errorType: string;
  personas: string[];
  count: number;
  timeWindow: { start: number; end: number };
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export async function detectBlindspot(fetcher: DataFetcher): Promise<Blindspot[]> {
  // Lấy tất cả lỗi TypeScript từ audit trail trong 3 ngày qua
  const errors = await fetcher.fetchErrors(3);
  const windowSize = 6 * 3600 * 1000; // 6 giờ
  const now = Date.now();
  const start = now - 3 * 24 * 3600 * 1000;

  const blindspots: Blindspot[] = [];

  // Chia thời gian thành các cửa sổ 6 giờ
  for (let t = start; t < now; t += windowSize) {
    const windowEnd = t + windowSize;
    const errorsInWindow = errors.filter(e => e.timestamp >= t && e.timestamp < windowEnd);

    // Gom theo loại lỗi
    const byType = new Map<string, Set<string>>(); // errorType -> set of personaId
    errorsInWindow.forEach(e => {
      if (!byType.has(e.type)) byType.set(e.type, new Set());
      byType.get(e.type)!.add(e.personaId);
    });

    // Kiểm tra từng loại
    for (const [errorType, personas] of byType.entries()) {
      if (personas.size >= 3) {
        blindspots.push({
          errorType,
          personas: Array.from(personas),
          count: errorsInWindow.filter(e => e.type === errorType).length,
          timeWindow: { start: t, end: windowEnd },
          severity: personas.size >= 5 ? 'HIGH' : 'MEDIUM'
        });
      }
    }
  }

  return blindspots;
}