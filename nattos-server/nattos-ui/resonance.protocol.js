/**
 * resonance.protocol.js — HeyNa → Nahere → Nauion
 * Perceptual background signal — subconscious awareness layer
 * Base: 432 Hz | Tick: 200ms | Safety: 200-1200 Hz
 */

const ResonanceProtocol = (() => {
  'use strict';

  // ── Config (sync với resonance.policy.json) ──
  const BASE_FREQ    = 432;
  const TICK_MS      = 200;
  const FREQ_MIN     = 200;
  const FREQ_MAX     = 1200;
  const AMP_MIN      = 0.01;
  const AMP_MAX      = 0.12;
  const COOLDOWN_MS  = 300;
  const MUTE_Z       = 5.0;

  let ctx = null;
  let oscillator = null;
  let gainNode = null;
  let currentZ = 1.0;
  let targetZ  = 1.0;
  let running  = false;
  let lastPulse = 0;
  let muted = false;

  // ── Log mapping: Z → frequency ──
  // f = BASE_FREQ * (1 + log10(1 + Z)) — Thiên Lớn + Kris đã chốt
  function zToFreq(Z) {
    const raw = BASE_FREQ * (1 + Math.log10(1 + Z));
    return Math.min(FREQ_MAX, Math.max(FREQ_MIN, raw));
  }

  // ── Z → amplitude ──
  function zToAmp(Z) {
    const norm = (Z - 0.1) / (MUTE_Z - 0.1);
    return Math.min(AMP_MAX, Math.max(AMP_MIN, AMP_MIN + norm * (AMP_MAX - AMP_MIN)));
  }

  // ── Init Web Audio ──
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(AMP_MIN, ctx.currentTime);
    gainNode.connect(ctx.destination);

    oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(BASE_FREQ, ctx.currentTime);
    oscillator.connect(gainNode);
    oscillator.start();
  }

  // ── Tick loop — 200ms ──
  function tick() {
    if (!running || !ctx) return;

    // Smooth Z
    currentZ += (targetZ - currentZ) * 0.15;

    if (currentZ >= MUTE_Z) {
      gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      muted = true;
    } else {
      muted = false;
      const freq = zToFreq(currentZ);
      const amp  = zToAmp(currentZ);
      oscillator.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
      gainNode.gain.setTargetAtTime(amp, ctx.currentTime, 0.05);
    }

    setTimeout(tick, TICK_MS);
  }

  // ── Pulse on anomaly ──
  function pulse() {
    if (!ctx || muted) return;
    const now = Date.now();
    if (now - lastPulse < COOLDOWN_MS) return;
    lastPulse = now;

    const pulseGain = ctx.createGain();
    pulseGain.gain.setValueAtTime(0.15, ctx.currentTime);
    pulseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    pulseGain.connect(ctx.destination);

    const pulseOsc = ctx.createOscillator();
    pulseOsc.type = 'sine';
    pulseOsc.frequency.setValueAtTime(880, ctx.currentTime);
    pulseOsc.connect(pulseGain);
    pulseOsc.start();
    pulseOsc.stop(ctx.currentTime + 0.2);

    // Haptic — mobile only
    if (navigator.vibrate) navigator.vibrate([80]);
  }

  // ── Subscribe nauion.state ──
  function connectEventBus() {
    // Lắng nghe từ nattos-server qua SSE hoặc window event
    window.addEventListener('nauion.state', (e) => {
      const { state, impedanceZ } = e.detail || {};
      if (impedanceZ !== undefined) targetZ = impedanceZ;
      if (state === 'whao') pulse();
    });

    // Polling Z từ /kenh/suc mỗi TICK_MS * 5
    setInterval(async () => {
      try {
        const r = await fetch('/kenh/nauion');
        const d = await r.json();
        if (d.impedanceZ !== undefined) targetZ = d.impedanceZ;
      } catch (_) {}
    }, TICK_MS * 5);
  }

  // ── Public API ──
  return {
    // HeyNa — khởi động
    wake() {
      init();
      running = true;
      connectEventBus();
      tick();
      console.log('[Resonance] HeyNa — protocol active | base:', BASE_FREQ, 'Hz');
    },

    // Cập nhật Z từ ngoài
    setZ(Z) { targetZ = Math.min(MUTE_Z, Math.max(0.1, Z)); },

    // Mute/unmute
    mute()   { gainNode?.gain.setTargetAtTime(0, ctx?.currentTime, 0.1); },
    unmute() { muted = false; },

    // State
    getState: () => ({ Z: currentZ, freq: zToFreq(currentZ), running, muted }),
  };
})();

// Auto-wake khi DOM ready
document.addEventListener('DOMContentLoaded', () => ResonanceProtocol.wake());
