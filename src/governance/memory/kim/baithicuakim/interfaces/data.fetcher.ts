// @ts-nocheck
export interface DataFetcher {
  fetchGraph(): Promise<any>;
  fetchCriticismEvents(days: number): Promise<any[]>;
  fetchPersonaMetrics(personaId: string, from: number, to: number): Promise<any>;
  fetchErrors(days: number): Promise<any[]>;
}