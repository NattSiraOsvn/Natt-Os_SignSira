//  — TODO: fix type errors, remove this pragma

// — pending proper fix

import { ProductionBase } from '../../productionbase';
import { EventEnvelope } from '../../../../types';

export class EmployeeCreatedHandler extends ProductionBase {
  readonly serviceName = 'hr-service';

  async handle(event: EventEnvelope) {
    const { employee_id, name, department } = event.payload;
    console.log(`[HR-HANDLER] Recording New Employee: ${name} (${employee_id})`);

    await this.logAudit('EMPLOYEE_RECORDED', event.trace.correlation_id, {
      employee_id,
      name,
      department
    }, event.event_id);
  }
}
