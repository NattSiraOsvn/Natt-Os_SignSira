// SuperDictionary — ground truth stub for ui-app
// Original: src/SuperDictionary.ts (server-side, not bundled here)

export type DictionaryKey = string;

export const SUPER_DICTIONARY: Record<string, unknown> = {
  conflict_resolution_rules: {},
  prohibited_words: [],
  SKUList: [],
  categories: ['Trang sức Nam', 'Trang sức Nữ', 'Kim cương rời'],
};

export const SUPER_DICTIONARY_CONTROL: Record<string, unknown> = {};

export class SuperDictionary {
  private static _version: number = Date.now();
  private static _dictionary: Record<string, unknown> = SUPER_DICTIONARY;

  static get(key?: string): Record<string, unknown> {
    if (key) return (this._dictionary[key] as Record<string, unknown>) ?? {};
    return this._dictionary;
  }

  static getVersion(): number { return this._version; }

  static load(data?: Record<string, unknown>): Record<string, unknown> {
    if (data) {
      this._dictionary = { ...this._dictionary, ...data };
      this._version = Date.now();
    }
    return this._dictionary;
  }
}

export default SuperDictionary;
