# Phase 5: Resonance Protocol – Vision & Physical Integration

## Concept
- Map iseu impedance Z to physical frequencies (audio, haptic, light).
- Use cymatics to generate visual patterns from standing waves.
- Enable external devices (sensors, wearables) to inject pulses into SmartLink.

## Implementation Roadmap
1. Define mapping: `frequency = baseFreq * Z` (baseFreq ~ 440 Hz).
2. Create a WebAudio backend that plays tones for active iseus.
3. Use canvas or Three.js to render cymatic patterns based on wave interference.
4. Physical sensor integration: emit pulses via MQTT/WebSocket.

## Status
- Planned for v10.0.0 after ISEU core is stable.
