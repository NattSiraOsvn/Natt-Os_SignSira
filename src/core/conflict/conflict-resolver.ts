export const ConflictEngine = {
  getUnresolved: (): any[] => [],
  resolveConflicts: async (
    items: any[],
    _options?: { businessType?: string }
  ): Promise<{ isAutoResolved: boolean; winner?: any; methodUsed?: string; conflicts?: any[] }> => {
    if (items.length < 2) return { isAutoResolved: true, winner: items[0], methodUsed: 'TRIVIAL' };
    const winner = items.reduce((best: any, cur: any) =>
      (cur.confidence ?? 0) > (best.confidence ?? 0) ? cur : best, items[0]);
    return { isAutoResolved: true, winner, methodUsed: 'CRP_CONFIDENCE' };
  },
};
export default ConflictEngine;
