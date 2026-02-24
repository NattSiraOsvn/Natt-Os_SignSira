export interface BaseEvent {
  event_id: string;
  event_type: string;
  event_version?: string;
  source_cell?: string;
  source_module?: string;
  actor?: { persona?: string; user_id?: string; persona_id?: string };
  domain?: string;
  timestamp: number;
  correlation_id?: string;
  payload: any;
  audit_required?: boolean;
}
