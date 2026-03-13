// @ts-nocheck
import { QuantumDefenseEngine } from "../../domain/services"
import { IQuantumDefenseRepository, IQuantumDefenseEventEmitter } from "../../ports"
import { ObserveEventStream } from "../use-cases/ObserveEventStream"
import { EvaluateCoherence } from "../use-cases/EvaluateCoherence"
import { PublishImmuneResponse } from "../use-cases/PublishImmuneResponse"
import { ImmuneState } from "../../domain/entities"

interface EventEnvelope {
  type: string
  source?: string
  payload?: Record<string, unknown>
}

export class QuantumDefenseApplicationService {
  private observeUC: ObserveEventStream
  private coherenceUC: EvaluateCoherence
  private publishUC: PublishImmuneResponse

  constructor(
    private engine: QuantumDefenseEngine,
    private repository: IQuantumDefenseRepository,
    private emitter: IQuantumDefenseEventEmitter
  ) {
    this.observeUC  = new ObserveEventStream(engine, repository)
    this.coherenceUC = new EvaluateCoherence(engine)
    this.publishUC  = new PublishImmuneResponse(emitter)
  }

  async onEvent(envelope: EventEnvelope): Promise<void> {
    if (envelope.type === "CalibrationCompleted") {
      const cpm = (envelope.payload?.["cpm"] as number) ?? 0
      this.coherenceUC.execute(cpm)
    }
    const events = await this.observeUC.execute(envelope)
    if (events.length > 0) {
      await this.publishUC.execute(events)
    }
  }

  getImmuneState(): ImmuneState {
    return this.engine.getImmuneState()
  }
}
