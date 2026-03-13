interface BoundaryConfig {
  cellId: string;
  allowedCallers: string[];
  allowedTargets: string[];
  maxPayloadKB: number;
}

export function createBoundaryGuard(config: BoundaryConfig) {
  return {
    cellId: config.cellId,
    validateCaller: (callerId: string): boolean => {
      const allowed = config.allowedCallers.includes(callerId);
      if (!allowed) console.warn(`[BOUNDARY:${config.cellId}] Rejected caller: ${callerId}`);
      return allowed;
    },
    validateTarget: (targetId: string): boolean => {
      const allowed = config.allowedTargets.includes(targetId);
      if (!allowed) console.warn(`[BOUNDARY:${config.cellId}] Rejected target: ${targetId}`);
      return allowed;
    },
    validatePayload: (payloadBytes: number): boolean => {
      const maxBytes = config.maxPayloadKB * 1024;
      return payloadBytes <= maxBytes;
    },
    getConfig: () => ({ ...config }),
  };
}
