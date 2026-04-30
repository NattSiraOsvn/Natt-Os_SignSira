//  — TODO: fix type errors, remove this pragma

// — pending proper fix

import { ProductionBase } from '../../productionbase';
import { EventEnvelope, TrainingStatus } from '../../../../types';

/**
 * 🎓 TRAINING COMPLETED HANDLER
 */
export class TrainingCompletedHandler extends ProductionBase {
  readonly serviceName = 'hr-service';

  async handle(event: EventEnvelope) {
    const { employee_id, course } = event.payload;
    console.log(`[HR-HANDLER] 🎓 Training Verified: ${course} for Employee ${employee_id}`);

    await this.logAudit('TRAINING_COMPLETED', event.trace.correlation_id, {
      employee_id,
      course,
      status: TrainingStatus.COMPLETED,
      verified_at: new Date().toISOString()
    }, event.event_id);
    
    // Tự động cộng KPI cho nhân sự khi hoàn thành khóa học
    // Trong thực tế sẽ phát event hr.employee.kpi_updated.v1
  }
}
