// Điều 3 §2 Hiến Pháp v5.0 — Capability
// Cell capabilities exposed via use-cases

// Capability: capability:showroom:display
export async function displayproduct(
  params: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; }> {
  // capability:showroom:display — DisplayProduct
  // Implementation deferred to domain engine
  return { success: true, data: params };
}
// Capability: capability:showroom:order
export async function takeshowroomorder(
  params: Record<string, unknown>
): Promise<{ success: boolean; data?: unknown; }> {
  // capability:showroom:order — TakeShowroomOrder
  // Implementation deferred to domain engine
  return { success: true, data: params };
}
