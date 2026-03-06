// STUB
export const getPrimaryMedia = (product: unknown): string | null => {
  if (!product || typeof product !== 'object') return null;
  const p = product as any;
  return p.imageUrl ?? p.media?.[0]?.url ?? null;
};
