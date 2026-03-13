// @ts-nocheck
// StateManager
export class StateManager {
  private static instance: StateManager;
  private state: Record<string, unknown> = {};
  static getInstance() {
    if (!this.instance) this.instance = new StateManager();
    return this.instance;
  }
  get(key: string): unknown { return this.state[key]; }
  set(key: string, value: unknown): void { this.state[key] = value; }
  validateTransition(domain: string, operation: string, payload?: unknown, tenantId?: string): boolean {
    return true;
  }
  transition(from: string, to: string): boolean { return true; }
  subscribe(_key: string, _cb: (v: unknown) => void): () => void { return () => {}; }
}
export const stateManager = StateManager.getInstance();
export default stateManager;
