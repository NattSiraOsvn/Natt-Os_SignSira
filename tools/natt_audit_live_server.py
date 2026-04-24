#!/usr/bin/env python3
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import argparse, json, os, socket, subprocess, urllib.parse, urllib.request, time, sys

ROOT = Path.cwd()
UI = ROOT / "docs" / "ui" / "NaU_audit.html"
EXT_JS = ROOT / "docs" / "ui" / "natt_audit_extensions.js"

EXCLUDE = {".git", "node_modules", "dist", "build", ".next", ".nuxt", "coverage", ".cache", ".turbo", "__pycache__", ".venv", "venv"}
TEXT_EXTS = {".ts",".tsx",".js",".jsx",".json",".md",".html",".css",".na",".anc",".phieu",".heyna",".sira",".kris",".si",".khai",".canonical",".ml",".thuo",".obitan",".txt",".yml",".yaml"}
CANONICAL_EXTS = {".anc",".si",".canonical",".khai",".ml",".sira",".heyna",".thuo",".obitan",".kris",".phieu",".na"}

def run(cmd, timeout=45):
    try:
        p = subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True, timeout=timeout)
        return {"cmd": " ".join(cmd), "exit": p.returncode, "stdout": p.stdout[-12000:], "stderr": p.stderr[-12000:]}
    except Exception as e:
        return {"cmd": " ".join(cmd), "exit": 999, "stdout": "", "stderr": str(e)}

def iter_files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDE]
        for name in filenames:
            p = Path(dirpath) / name
            try:
                if p.stat().st_size > 1_500_000:
                    continue
            except OSError:
                continue
            yield p

def read(p):
    try:
        return p.read_text("utf-8", errors="ignore")
    except Exception:
        return ""

def rel(p):
    try:
        return p.relative_to(ROOT).as_posix()
    except Exception:
        return str(p)

def json_response(handler, obj, code=200):
    raw = json.dumps(obj, ensure_ascii=False, indent=2).encode("utf-8")
    handler.send_response(code)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(raw)))
    handler.end_headers()
    handler.wfile.write(raw)

def runtime_url():
    return os.environ.get("NATT_RUNTIME_URL", "http://127.0.0.1:3001").rstrip("/")

def api_health():
    out = {
        "ok": True,
        "server": "natt_audit_live_server",
        "root": str(ROOT),
        "ui_exists": UI.exists(),
        "ext_js_exists": EXT_JS.exists(),
        "runtime_url": runtime_url(),
        "time": int(time.time())
    }
    try:
        with urllib.request.urlopen(runtime_url() + "/api/health", timeout=2) as r:
            out["runtime_health"] = json.loads(r.read().decode("utf-8", "ignore"))
    except Exception as e:
        out["runtime_health_error"] = str(e)
    return out

def api_git():
    return {
        "branch": run(["git","branch","--show-current"]),
        "head": run(["git","rev-parse","--short","HEAD"]),
        "status": run(["git","status","--short"]),
        "last_commit": run(["git","log","--oneline","-1"])
    }

def api_wave():
    files = list(iter_files())
    text_files = [p for p in files if p.suffix.lower() in TEXT_EXTS]
    canonical = [p for p in files if p.suffix.lower() in CANONICAL_EXTS]

    patterns = {
        "W0_repo": ["package.json", "tsconfig.json", "src"],
        "W1_file_layer": [".anc", ".na", ".phieu", "Sira_NAMESPACE", "Nauion", "NaUion"],
        "W2_loader_parser": ["loader", "parser", "interpreter", "Runtime", "readFileSync"],
        "W3_enforcement": ["required", "on_fail", "fail-closed", "Gatekeeper", "SiraSign", "audit"],
        "W4_transport": ["Mach HeyNa", "HeyNa", "/mach/heyna", "/phat/nauion", "EventEnvelope", "causation_id", "correlation_id", "span_id"],
        "W5_lifecycle": ["thoai-sinh", "thoái-sinh", "generation_id", "tombstone", "KhaiCell", "TimeRadiation", "R_info", "capacity"]
    }

    evidence = {k: [] for k in patterns}
    for p in text_files:
        c = read(p)
        path = rel(p)
        for k, pats in patterns.items():
            if len(evidence[k]) >= 12:
                continue
            if any(x in c or x in path for x in pats):
                evidence[k].append(path)

    summary = {}
    full = "NONE"
    for k in patterns:
        passed = bool(evidence[k])
        summary[k] = {"pass": passed, "evidence": evidence[k][:12]}
        if passed:
            full = k.split("_")[0]
        else:
            break

    return {
        "ok": True,
        "total_files": len(files),
        "text_files": len(text_files),
        "canonical_ext_files": len(canonical),
        "runtime_reached": full,
        "summary": summary
    }

def api_repo_scan():
    files = list(iter_files())
    text_files = [p for p in files if p.suffix.lower() in TEXT_EXTS]
    legacy_json = [p for p in files if p.suffix.lower() == ".json" and p.name not in {"package-lock.json"}]
    legacy_js = [p for p in files if p.suffix.lower() in {".js",".jsx"}]
    canonical = [p for p in files if p.suffix.lower() in CANONICAL_EXTS]

    refs = {}
    for key in ["localStorage", "EventEnvelope", "Gatekeeper", "SiraSign", "SmartLink", "HeyNa", "KhaiCell", "audit", "tenant_id", "causation_id", "correlation_id", "span_id"]:
        refs[key] = []
        for p in text_files:
            c = read(p)
            if key in c:
                refs[key].append(rel(p))
                if len(refs[key]) >= 20:
                    break

    return {
        "ok": True,
        "total_files": len(files),
        "text_files": len(text_files),
        "canonical_ext_files": len(canonical),
        "legacy_json_candidates": len(legacy_json),
        "legacy_js_candidates": len(legacy_js),
        "samples": {
            "canonical": [rel(p) for p in canonical[:20]],
            "legacy_json": [rel(p) for p in legacy_json[:20]],
            "legacy_js": [rel(p) for p in legacy_js[:20]]
        },
        "refs": refs
    }

def api_build_tsc():
    return run(["npx","tsc","--noEmit"], timeout=90)

def api_audit_tail():
    candidates = []
    for p in iter_files():
        s = rel(p).lower()
        if "audit" in s and p.suffix.lower() in TEXT_EXTS:
            candidates.append(p)
    data = []
    for p in candidates[:10]:
        lines = read(p).splitlines()[-40:]
        data.append({"file": rel(p), "tail": lines})
    return {"ok": True, "files": data}

def api_docs_index():
    docs = []
    for base in [ROOT / "docs"]:
        if not base.exists():
            continue
        for p in base.rglob("*"):
            if p.is_file() and p.suffix.lower() in {".na",".anc",".phieu",".md",".txt"}:
                docs.append(rel(p))
    return {"ok": True, "count": len(docs), "docs": docs[:300]}

def api_repo_search(q):
    q = (q or "").strip()
    if not q:
        return {"ok": False, "error": "missing query"}
    hits = []
    for p in iter_files():
        if p.suffix.lower() not in TEXT_EXTS:
            continue
        c = read(p)
        idx = c.lower().find(q.lower())
        if idx >= 0:
            line = c[:idx].count("\\n") + 1
            snippet = c[max(0, idx-90):idx+160].replace("\\n"," ")
            hits.append({"file": rel(p), "line": line, "snippet": snippet})
            if len(hits) >= 80:
                break
    return {"ok": True, "query": q, "hits": hits}

def api_emit(payload):
    target = runtime_url() + "/api/events/emit"
    raw = json.dumps(payload or {"type":"runtime.ui_extension_test","payload":{"source":"audit-ui"},"cell":"runtime-cell"}).encode("utf-8")
    try:
        req = urllib.request.Request(target, data=raw, headers={"Content-Type":"application/json"})
        with urllib.request.urlopen(req, timeout=4) as r:
            body = r.read().decode("utf-8", "ignore")
        return {"ok": True, "proxied": True, "target": target, "response": body}
    except Exception as e:
        return {"ok": True, "proxied": False, "dry_run": True, "target": target, "error": str(e), "payload": json.loads(raw.decode("utf-8"))}

INJECT = '<script src="/natt_audit_extensions.js"></script>'

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT / "docs" / "ui"), **kwargs)

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        query = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)

        if path == "/favicon.ico":
            self.send_response(204); self.end_headers(); return
        if path == "/api/health":
            return json_response(self, api_health())
        if path == "/api/git":
            return json_response(self, api_git())
        if path == "/api/wave":
            return json_response(self, api_wave())
        if path == "/api/repo-scan":
            return json_response(self, api_repo_scan())
        if path == "/api/build-tsc":
            return json_response(self, api_build_tsc())
        if path == "/api/audit-tail":
            return json_response(self, api_audit_tail())
        if path == "/api/docs-index":
            return json_response(self, api_docs_index())
        if path == "/api/repo-search":
            return json_response(self, api_repo_search(query.get("q", [""])[0]))

        if path in ["/", "/NaU_audit.html"]:
            if not UI.exists():
                self.send_response(404); self.end_headers()
                self.wfile.write(f"Missing UI: {UI}".encode("utf-8"))
                return
            html = read(UI)
            if INJECT not in html:
                html = html.replace("</body>", INJECT + "\\n</body>") if "</body>" in html else html + INJECT
            raw = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(raw)))
            self.end_headers()
            self.wfile.write(raw)
            return

        return super().do_GET()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        length = int(self.headers.get("Content-Length", "0") or "0")
        body = self.rfile.read(length).decode("utf-8", "ignore") if length else "{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}
        if path == "/api/emit":
            return json_response(self, api_emit(payload))
        return json_response(self, {"ok": False, "error": "unknown POST"}, 404)

    def log_message(self, fmt, *args):
        print("[natt-audit-runtime]", fmt % args)

def find_port(start=5177, end=5199):
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("No free port 5177-5199")

def verify():
    errors = []
    if not UI.exists():
        errors.append(f"missing {UI}")
    if not EXT_JS.exists():
        errors.append(f"missing {EXT_JS}")
    if errors:
        for e in errors:
            print("VERIFY_FAIL:", e)
        return 1
    print("VERIFY_PASS: audit runtime extension server ready")
    return 0

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--verify", action="store_true")
    args = parser.parse_args()
    if args.verify:
        raise SystemExit(verify())

    port = find_port()
    url = f"http://127.0.0.1:{port}/NaU_audit.html"
    print("=" * 88)
    print("Natt-OS AUDIT UI — RUNTIME EXTENSION HUB")
    print("=" * 88)
    print("ROOT       :", ROOT)
    print("UI         :", UI)
    print("RUNTIME URL:", runtime_url())
    print("URL        :", url)
    print("APIs       : /api/health /api/git /api/wave /api/repo-scan /api/build-tsc")
    print("BOUNDARY   : localhost only; no arbitrary shell; execute is dry-run/proxy only")
    print("STOP       : Ctrl + C")
    print("=" * 88)
    try:
        import webbrowser
        webbrowser.open(url)
    except Exception:
        pass
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()

if __name__ == "__main__":
    main()
