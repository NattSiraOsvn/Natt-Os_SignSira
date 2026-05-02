export interface HealingLog {
  id: string
  file: string
  issue: string
  action: string
  resolvedAt: number
}

export class SelfHealingLogger {
  private logs: HealingLog[] = []

  log(file: string, issue: string, action: string): void {
    this.logs.push({
      id: `heal-${Date.now()}`,
      file,
      issue,
      action,
      resolvedAt: Date.now()
    })
    console.warn(`[metabolism/healing] ${file} — ${issue} → ${action}`)
  }

  getRecent(n = 20): HealingLog[] {
    return this.logs.slice(-n)
  }
}