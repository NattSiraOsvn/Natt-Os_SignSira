// @ts-nocheck
import { MetabolismEvent } from "../types"

export interface ArchiveEntry {
  physicalPath: string
  size: string
  cellTarget: string
  bridgedAt: number
}

export class ArchiveBridge {
  private queue: ArchiveEntry[] = []
  private handlers: Array<(event: MetabolismEvent) => void> = []

  onEvent(handler: (event: MetabolismEvent) => void): void {
    this.handlers.push(handler)
  }

  bridge(physicalPath: string, size: string, cellTarget: string): void {
    const entry: ArchiveEntry = {
      physicalPath,
      size,
      cellTarget,
      bridgedAt: Date.now()
    }
    this.queue.push(entry)

    const event: MetabolismEvent = {
      type: "ArchiveBridged",
      source: "archive-bridge",
      payload: entry as unknown as Record<string, unknown>,
      timestamp: Date.now()
    }
    for (const h of this.handlers) h(event)
    console.info(`[archive-bridge] ${physicalPath} (${size}) → ${cellTarget}`)
  }

  getQueue(): ArchiveEntry[] {
    return [...this.queue]
  }
}
