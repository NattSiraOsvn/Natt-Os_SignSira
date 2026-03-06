const _blocklist = new Set<string>();
export const BoundaryGuardService = {
  block: (sourceId: string): void => { _blocklist.add(sourceId); },
  unblock: (sourceId: string): void => { _blocklist.delete(sourceId); },
  isBlocked: (sourceId: string): boolean => _blocklist.has(sourceId),
  getBlocklist: (): string[] => [..._blocklist],
  checkRequest: (sourceId: string, _action: string): { allowed: boolean; reason?: string } => {
    if (_blocklist.has(sourceId)) return { allowed: false, reason: "BLOCKED" };
    return { allowed: true };
  },
};
