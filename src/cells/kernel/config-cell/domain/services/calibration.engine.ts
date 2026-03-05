// ============================================================================
// src/cells/kernel/config-cell/domain/services/calibration.engine.ts
// Migrated from: services/calibration/calibration-engine.ts
// Clean — no ghost imports
// Migrated by Băng — 2026-03-06
// ============================================================================

import { InputPersona, CalibrationData, InputMetrics } from '@/types';

export class CalibrationEngine {
  private static instance: CalibrationEngine;
  private userProfiles: Map<string, CalibrationData> = new Map();

  private readonly PERSONA_BASELINES: Record<InputPersona, number> = {
    [InputPersona.FAST_TYPIST]: 350,
    [InputPersona.NORMAL_USER]: 200,
    [InputPersona.CAREFUL_REVIEWER]: 80,
    [InputPersona.VOICE_PREFERRED]: 40
  };

  public static getInstance(): CalibrationEngine {
    if (!CalibrationEngine.instance) CalibrationEngine.instance = new CalibrationEngine();
    return CalibrationEngine.instance;
  }

  public saveProfile(profile: CalibrationData): void {
    this.userProfiles.set(profile.userId, profile);
  }

  public getProfile(userId: string): CalibrationData | null {
    return this.userProfiles.get(userId) || null;
  }

  public identifyPersona(metrics: InputMetrics): { persona: InputPersona; confidence: number } {
    const cpm = metrics.currentCPM;
    let persona = InputPersona.NORMAL_USER;
    let confidence = 0.5;

    if (cpm > 300) { persona = InputPersona.FAST_TYPIST; confidence = 0.9; }
    else if (cpm > 150) { persona = InputPersona.NORMAL_USER; confidence = 0.8; }
    else if (cpm > 50) { persona = InputPersona.CAREFUL_REVIEWER; confidence = 0.75; }
    else { persona = InputPersona.VOICE_PREFERRED; confidence = 0.7; }

    return { persona, confidence };
  }

  public calculateAdaptiveThreshold(userId: string, currentIntensity: number): number {
    const profile = this.getProfile(userId);
    const baseThreshold = profile
      ? this.PERSONA_BASELINES[profile.detectedPersona] || 200
      : 200;

    // Adaptive: tăng ngưỡng nếu user đang hoạt động nhiều
    const adaptiveFactor = 1 + (currentIntensity * 0.5);
    return Math.round(baseThreshold * adaptiveFactor);
  }
}

export const Calibration = CalibrationEngine.getInstance();
