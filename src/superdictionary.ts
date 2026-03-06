// NATT-OS SuperDictionary
export const SUPER_DICTIONARY: Record<string, unknown> = {};
export const SUPER_DICTIONARY_CONTROL = {
  get: (k: string): unknown => SUPER_DICTIONARY[k] ?? null,
  set: (k: string, v: unknown): void => { SUPER_DICTIONARY[k] = v; },
  delete: (k: string): void => { delete SUPER_DICTIONARY[k]; },
  keys: (): string[] => Object.keys(SUPER_DICTIONARY),
};
export default SUPER_DICTIONARY_CONTROL;
