export function resolveDomainId(causationId: string, eventPayload?: any): string | undefined {
  if (!causationId) return undefined;
  const orderMatch = causationId.match(/^(order-|ord-)([a-zA-Z0-9_-]+)/i);
  if (orderMatch) return `order-${orderMatch[2]}`;
  const contractMatch = causationId.match(/^(contract-|ct-)([a-zA-Z0-9_-]+)/i);
  if (contractMatch) return `contract-${contractMatch[2]}`;
  const productMatch = causationId.match(/^(product-|sku-)([a-zA-Z0-9_-]+)/i);
  if (productMatch) return `product-${productMatch[2]}`;
  if (causationId.includes('-')) return causationId;
  return undefined;
}
