export type ConfigScope = "SYSTEM" | "CELL" | "USER";
export interface ConfigKey { scope: ConfigScope; namespace: string; name: string; }
export const buildKey = (k: ConfigKey): string => `${k.scope}::${k.namespace}::${k.name}`;
