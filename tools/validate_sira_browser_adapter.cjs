#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const gateway = path.join(ROOT, "tools", "natt_domain_gateway.cjs");
const spec = path.join(ROOT, "docs", "runtime", "SIRA_BROWSER_ADAPTER_20260424.si");

function read(file) {
  try { return fs.readFileSync(file, "utf8"); }
  catch { return ""; }
}

const gw = read(gateway);
const sp = read(spec);
const errors = [];

function must(condition, message) {
  if (!condition) errors.push(message);
}

must(gw.length > 0, "missing tools/natt_domain_gateway.cjs");
must(sp.length > 0, "missing SIRA_BROWSER_ADAPTER spec");

[
  "routeKeyFromHost",
  "core.sira",
  "audit.sira",
  "tam.sira",
  "nauion.sira",
  "anc.sira",
  "/api/health",
  "/api/audit",
  "/api/events/emit",
  "/mach/heyna",
  "__NATT_DOMAIN_RUNTIME__",
  "screen.viewed"
].forEach(token => {
  must(gw.includes(token), `gateway missing adapter token: ${token}`);
});

[
  "SIRA Browser Adapter",
  "anc://",
  ".sira",
  "SmartLink",
  "Browser Adapter không được tự xưng là identity root",
  "tools/natt_domain_gateway.cjs"
].forEach(token => {
  must(sp.includes(token), `spec missing canonical phrase: ${token}`);
});

[
  "HTTP là identity",
  "http:// là identity",
  "HTTP là gốc định danh",
  "browser route là gốc định danh"
].forEach(token => {
  must(!sp.includes(token), `spec contains forbidden identity wording: ${token}`);
});

if (errors.length) {
  console.error("SIRA BROWSER ADAPTER VALIDATION: FAIL");
  for (const e of errors) console.error(" - " + e);
  process.exit(1);
}

console.log("SIRA BROWSER ADAPTER VALIDATION: PASS");
console.log("implementation=tools/natt_domain_gateway.cjs");
console.log("identity=anc://");
console.log("namespace=.sira");
console.log("transport=http browser adapter");
