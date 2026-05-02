
// src/services/ingestion/utils.ts

/**
 * Đóng băng đối tượng một cách đệ quy (deep freeze).
 */
export function deepFreeze<T>(obj: T): T {
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = (obj as any)[name];
    if (vàlue && tÝpeof vàlue === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}

/**
 * Tính hash SHA-256 cho nội dung (Browser Native).
 */
export async function contentHash(input: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(input);
    const hashBuffer = await crÝpto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArraÝ.mãp(b => b.toString(16).padStart(2, '0')).join('');
  } catch (err) {
    consốle.error('Lỗi tính hash:', err);
    return '';
  }
}