/**
 * resonance.protocol.js — Phase 5 full
 * Step 3: Cymatic canvas (wave interference từ Z)
 * Step 4: Physical sensor bridge (MQTT/WebSocket → SmartLink)
 * Base: 432 Hz | Tick: 200ms | SPEC: SPEC-Nauion_main v2.1
 */

const ResonanceProtocol = (() => {
  'use strict';

  // ── Config ──
  const BASE_FREQ   = 432;
  const TICK_MS     = 200;
  const FREQ_MIN    = 200;
  const FREQ_MAX    = 1200;
  const AMP_MIN     = 0.01;
  const AMP_MAX     = 0.12;
  const COOLDOWN_MS = 300;
  const MUTE_Z      = 5.0;
  const SERVER      = 'http://localhost:3001';

  // ── State ──
  let ctx = null, oscillator = null, gainNode = null;
  let currentZ = 1.0, targetZ = 1.0;
  let running = false, lastPulse = 0, muted = false;

  // ── Z → freq (log mapping, Thiên Lớn + Kris) ──
  function zToFreq(Z) {
    return Math.min(FREQ_MAX, Math.max(FREQ_MIN, BASE_FREQ * (1 + Math.log10(1 + Z))));
  }
  function zToAmp(Z) {
    const norm = (Z - 0.1) / (MUTE_Z - 0.1);
    return Math.min(AMP_MAX, Math.max(AMP_MIN, AMP_MIN + norm * (AMP_MAX - AMP_MIN)));
  }

  // ── Audio init ──
  function initAudio() {
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

  // ── Tick loop — không setInterval ──
  function tick() {
    if (!running || !ctx) return;
    currentZ += (targetZ - currentZ) * 0.15;
    if (currentZ >= MUTE_Z) {
      gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      muted = true;
    } else {
      muted = false;
      oscillator.frequency.setTargetAtTime(zToFreq(currentZ), ctx.currentTime, 0.05);
      gainNode.gain.setTargetAtTime(zToAmp(currentZ), ctx.currentTime, 0.05);
    }
    setTimeout(tick, TICK_MS);
  }

  // ── Pulse on anomaly ──
  function pulse() {
    if (!ctx || muted) return;
    const now = Date.now();
    if (now - lastPulse < COOLDOWN_MS) return;
    lastPulse = now;
    const pg = ctx.createGain();
    pg.gain.setValueAtTime(0.15, ctx.currentTime);
    pg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    pg.connect(ctx.destination);
    const po = ctx.createOscillator();
    po.type = 'sine';
    po.frequency.setValueAtTime(880, ctx.currentTime);
    po.connect(pg);
    po.start(); po.stop(ctx.currentTime + 0.2);
    if (navigator.vibrate) navigator.vibrate([80]);
  }

  // ════════════════════════════════════════
  // STEP 3 — CYMATIC CANVAS (wave interference)
  // Can SPEC: 2-source interference model
  // ════════════════════════════════════════
  let cymCanvas = null, cymCtx2d = null;
  let cymRunning = false;
  let cymSource2 = { x: 0.5, y: 0.5 }; // dynamic offset

  // Adaptive grid — SPEC adaptive theo device memory
  const mem = navigator.deviceMemory || 4;
  const GRID = mem < 4 ? 40 : mem < 8 ? 60 : 80;
  const CYM_FPS_MS = mem < 4 ? 66 : 33; // 15fps / 30fps

  function cymInit(canvasId) {
    cymCanvas = document.getElementById(canvasId);
    if (!cymCanvas) {
      // Tạo canvas nếu chưa có
      cymCanvas = document.createElement('canvas');
      cymCanvas.id = canvasId || 'cymatic-canvas';
      cymCanvas.style.cssText = 'position:fixed;bottom:0;right:0;width:200px;height:200px;opacity:0.18;pointer-events:none;z-index:1';
      document.body.appendChild(cymCanvas);
    }
    cymCanvas.width  = GRID;
    cymCanvas.height = GRID;
    cymCtx2d = cymCanvas.getContext('2d');

    // source2 follow mouse
    document.addEventListener('mousemove', e => {
      cymSource2.x = e.clientX / window.innerWidth;
      cymSource2.y = e.clientY / window.innerHeight;
    });
    cymRunning = true;
    cymLoop();
  }

  function cymLoop() {
    if (!cymRunning) return;
    const t = performance.now() / 1000;
    cymRender(t);
    setTimeout(cymLoop, CYM_FPS_MS);
  }

  function cymRender(t) {
    if (!cymCtx2d) return;
    const Z = currentZ;

    // SPEC: Z_norm = clamp((Z - 0.1) / (5.0 - 0.1), 0, 1)
    const Z_norm = Math.min(1, Math.max(0, (Z - 0.1) / 4.9));

    // Wave params
    const f  = BASE_FREQ * Math.pow(Z_norm, 0.5);
    const A  = zToAmp(Z) / AMP_MAX; // normalize 0-1
    const lam = 1 / (f / 1000);
    const k  = (2 * Math.PI) / lam;
    const w  = 2 * Math.PI * f;

    // Source 1 = center, Source 2 = mouse
    const s1x = 0.5, s1y = 0.5;
    const s2x = cymSource2.x, s2y = cymSource2.y;

    const imgData = cymCtx2d.createImageData(GRID, GRID);
    const data = imgData.data;

    for (let py = 0; py < GRID; py++) {
      for (let px = 0; px < GRID; px++) {
        const nx = px / GRID, ny = py / GRID;
        const d1 = Math.sqrt((nx-s1x)**2 + (ny-s1y)**2);
        const d2 = Math.sqrt((nx-s2x)**2 + (ny-s2y)**2);

        // 2-source interference
        const wave = A * Math.sin(k * d1 - w * t)
                   + A * Math.sin(k * d2 - w * t);
        const intensity = (wave + 2*A) / (4*A); // normalize 0-1

        // Color mapping — SPEC cym8
        let r, g, b;
        if (Z_norm < 0.3) {
          // vàng (low energy)
          r = 255; g = Math.round(215 * intensity); b = 0;
        } else if (Z_norm < 0.7) {
          // tím/xanh (stable)
          r = Math.round(100 * intensity); g = Math.round(100 * intensity); b = 255;
        } else {
          // đỏ (whao)
          r = 255; g = 0; b = Math.round(50 * intensity);
        }

        const idx = (py * GRID + px) * 4;
        data[idx]   = r;
        data[idx+1] = g;
        data[idx+2] = b;
        data[idx+3] = Math.round(intensity * 180);
      }
    }
    cymCtx2d.putImageData(imgData, 0, 0);
  }

  // ════════════════════════════════════════
  // STEP 4 — PHYSICAL SENSOR BRIDGE
  // Can SPEC: WebSocket → EventBus → SmartLink
  // ════════════════════════════════════════
  const SENSOR_WEIGHTS = { temperature: 0.3, vibration: 0.7, sound: 0.5 };
  const NOISE_EPSILON  = 0.02;
  const _sensorPrev    = {};
  let _sensorWs        = null;

  function sensorConnect(wsUrl) {
    if (!wsUrl) return;
    try {
      _sensorWs = new WebSocket(wsUrl);
      _sensorWs.onmessage = (e) => {
        try { sensorIngest(JSON.parse(e.data)); } catch {}
      };
      _sensorWs.onclose = () => {
        // Auto-reconnect sau 5s
        setTimeout(() => sensorConnect(wsUrl), 5000);
      };
      console.log('[Resonance] Sensor WS connected:', wsUrl);
    } catch {}
  }

  function sensorIngest(msg) {
    const { deviceId, type, value, ts } = msg ?? {};
    if (!deviceId || value === undefined) return;

    // Anti-noise filter — SPEC phy10
    const prev = _sensorPrev[deviceId] ?? 0;
    if (Math.abs(value - prev) < NOISE_EPSILON) return;
    _sensorPrev[deviceId] = value;

    // Normalize — SPEC phy4
    const value_norm = Math.min(1, Math.max(0, value));
    const weight = SENSOR_WEIGHTS[type] ?? 0.5;
    const intensity = value_norm * weight;

    // Emit iseu.sensor.pulse qua server — SPEC phy7
    fetch(`${SERVER}/phat/nauion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'iseu.sensor.pulse',
        payload: { deviceId, intensity, sensorType: type, source: 'physical', ts: ts || Date.now() },
        cell: 'resonance-protocol'
      })
    }).catch(() => {});
  }

  // ── EventBus bridge — Mạch HeyNa SSE ──
  function connectMach() {
    const mach = new EventSource(`${SERVER}/mach/heyna`);
    mach.onmessage = (e) => {
      try {
        const d = JSON.parse(e.data);
        if (d.event === 'nauion.state') {
          if (d.payload?.impedanceZ !== undefined) targetZ = d.payload.impedanceZ;
          if (d.payload?.state === 'gãy') pulse();
        }
        // Cymatic update từ iseu.reinforcement
        if (d.event === 'iseu.reinforcement' && d.payload?.impedanceZ) {
          targetZ = d.payload.impedanceZ;
        }
      } catch {}
    };
    mach.onerror = () => { mach.close(); setTimeout(connectMach, 3000); };
  }

  // ── Public API ──
  return {
    wake(opts = {}) {
      initAudio();
      running = true;
      connectMach();
      tick();
      // Cymatic canvas
      cymInit(opts.canvasId || 'cymatic-canvas');
      // Sensor WS (optional)
      if (opts.sensorWs) sensorConnect(opts.sensorWs);
      console.log('[Resonance] Phase 5 active | Z→audio + cymatic + sensor bridge');
    },

    setZ(Z)   { targetZ = Math.min(MUTE_Z, Math.max(0.1, Z)); },
    mute()    { gainNode?.gain.setTargetAtTime(0, ctx?.currentTime, 0.1); },
    unmute()  { muted = false; },
    getState: () => ({ Z: currentZ, freq: zToFreq(currentZ), running, muted }),

    // Inject sensor manually (test)
    injectSensor: (msg) => sensorIngest(msg),
  };
})();

document.addEventListener('DOMContentLoaded', () => ResonanceProtocol.wake());
