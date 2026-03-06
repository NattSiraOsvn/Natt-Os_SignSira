export enum ConflictResolutionMethod {
  LAST_WRITE_WINS  = "LAST_WRITE_WINS",
  FIRST_WRITE_WINS = "FIRST_WRITE_WINS",
  MERGE            = "MERGE",
  MANUAL           = "MANUAL",
}

export interface Conflict<T = unknown> {
  id: string;
  field?: string;
  localValue: T;
  remoteValue: T;
  localTimestamp: number;
  remoteTimestamp: number;
  resolved: boolean;
  resolution?: T;
  resolvedBy?: ConflictResolutionMethod;
}

const _unresolved: Conflict[] = [];

export const ConflictEngine = {
  detect: <T>(local: T, remote: T): boolean =>
    JSON.stringify(local) !== JSON.stringify(remote),

  resolve: <T>(
    local: T, remote: T,
    method = ConflictResolutionMethod.LAST_WRITE_WINS,
    localTs = 0, remoteTs = Date.now()
  ): T => {
    switch (method) {
      case ConflictResolutionMethod.FIRST_WRITE_WINS:
        return localTs <= remoteTs ? local : remote;
      case ConflictResolutionMethod.MERGE:
        if (typeof local === "object" && typeof remote === "object")
          return { ...(local as object), ...(remote as object) } as T;
        return remote;
      case ConflictResolutionMethod.MANUAL:
        _unresolved.push({ id: `CF-${Date.now()}`, localValue: local, remoteValue: remote, localTimestamp: localTs, remoteTimestamp: remoteTs, resolved: false });
        return local;
      default: // LAST_WRITE_WINS
        return remoteTs >= localTs ? remote : local;
    }
  },

  getUnresolved: (): Conflict[] => [..._unresolved],

  manualResolve: <T>(conflictId: string, resolution: T): void => {
    const c = _unresolved.find(x => x.id === conflictId);
    if (c) { c.resolved = true; c.resolution = resolution; c.resolvedBy = ConflictResolutionMethod.MANUAL; }
  },

  clearResolved: (): void => {
    const i = _unresolved.findIndex(x => x.resolved);
    if (i >= 0) _unresolved.splice(i, 1);
  },
};

// Re-export alias để cũ dùng
export { ConflictEngine as ConflictResolver };
