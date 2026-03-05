export interface Reporter {
  report(type: string, data: any): Promise<void>;
}