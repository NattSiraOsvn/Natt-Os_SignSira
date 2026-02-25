import { EventEnvelope, PersonaID } from '../../types';
import { NotifyBus } from '../notificationservice';

/**
 * 🤖 ORPHAN DETECTION BOT
 * Source: NATTCELL KERNEL | FIX: PersonaID casing, removed unused imports
 */
export class OrphanDetectionBot {
  private static instance: OrphanDetectionBot;
  private readonly ORPHAN_THRESHOLD_MS = 300000;

  public static getInstance() {
    if (!OrphanDetectionBot.instance) OrphanDetectionBot.instance = new OrphanDetectionBot();
    return OrphanDetectionBot.instance;
  }

  public async scanForOrphans(events: EventEnvelope[]) {
    const now = Date.now();
    const orphans = events.filter(e => {
      if (e.event_name.includes('INIT')) return false;
      const hasCausation = !!e.trace.causation_id;
      const isOldEnough = (now - new Date(e.occurred_at).getTime()) > this.ORPHAN_THRESHOLD_MS;
      return !hasCausation && isOldEnough;
    });
    if (orphans.length > 0) {
      this.triggerAlert(orphans);
    }
  }

  private triggerAlert(orphans: EventEnvelope[]) {
    NotifyBus.push({
      type: 'RISK',
      title: 'ORPHAN EVENTS DETECTED',
      content: `Phát hiện ${orphans.length} sự kiện không rõ nguồn gốc.`,
      persona: PersonaID.KRIS,
      priority: 'HIGH'
    });
    console.error(`[ORPHAN-BOT] Detected ${orphans.length} orphaned events!`, orphans);
  }
}

export const OrphanBot = OrphanDetectionBot.getInstance();
