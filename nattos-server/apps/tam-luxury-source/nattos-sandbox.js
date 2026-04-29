// ===== natt-os Phase 2.5 Sandbox =====
// Ground truth selectors từ daily-work-app.html

const sandboxMap = [
  { selector: ".topbar",     layer: 2 },
  { selector: ".login-box",  layer: 3 },
  { selector: ".modal",      layer: 3 },
  { selector: ".task-card",  layer: 1 },
  { selector: ".kpi-card",   layer: 1 },
  { selector: ".section",    layer: 2 },
  { selector: ".btn",        layer: 2 },
  { selector: ".btn-ghost",  layer: 2 }
];

sandboxMap.forEach(item => {
  document.querySelectorAll(item.selector).forEach(el => {
    el.setAttribute("data-ui", "true");
    el.setAttribute("data-ui-layer", item.layer);
  });
});

console.log("[natt-os Sandbox] Injected:", 
  sandboxMap.map(i => `${i.selector}(L${i.layer})`).join(", "));
