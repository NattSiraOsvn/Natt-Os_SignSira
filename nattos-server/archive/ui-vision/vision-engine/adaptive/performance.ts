// src/vision-engine/adaptive/performance.ts

export function getPerformanceProfile() {
  const memory = (navigator as any).deviceMemory || 4
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  return {
    particleCount: memory < 4 ? 10 : isMobile ? 20 : 30,
    enableBlur: memory >= 4 && !isMobile,
    enableCaustics: memory >= 8 && !isMobile,
    enableBloom: memory >= 4,
  }
}
