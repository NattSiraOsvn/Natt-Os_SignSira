/**
 * Ensures an event payload contains a causationId.
 * If not, generates one based on domainId and timestamp.
 */
export function ensureCausationId(event: any, domainId?: string): string {
  if (event.causationId) return event.causationId;
  if (event.payload?.causationId) return event.payload.causationId;
  const id = domainId || `gen-${Date.now()}-${Math.random().toString(36)}`;
  return id;
}
