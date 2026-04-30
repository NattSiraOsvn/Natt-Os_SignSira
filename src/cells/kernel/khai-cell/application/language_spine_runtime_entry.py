import json
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

def _find_repo_root() -> Path:
    p = Path(__file__).resolve()
    for base in [p] + list(p.parents):
        if (base / "src/cells/kernel/khai-cell/domain/services/language_spine_runtime_bridge.py").exists():
            return base
    raise RuntimeError("repo root not found")

REPO_ROOT = _find_repo_root()
BRIDGE_PATH = REPO_ROOT / "src/cells/kernel/khai-cell/domain/services/language_spine_runtime_bridge.py"
VECTORS_PATH = REPO_ROOT / "tools/dialect-cipher/numeric_test_vectors_v0_1.json"

def _load_bridge():
    spec = spec_from_file_location("language_spine_runtime_bridge", BRIDGE_PATH)
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.LanguageSpineRuntimeBridge

LanguageSpineRuntimeBridge = _load_bridge()

def run_language_spine_runtime_fixture() -> dict:
    bridge = LanguageSpineRuntimeBridge()
    report = bridge.process_fixture_file(VECTORS_PATH)
    return {
        "schema": "natt-os/runtime-entry/v0.1",
        "status": "PASS",
        "source": "khai-cell/application",
        "count": report["count"],
        "results": report["results"],
    }

def run_language_spine_runtime_row(row: dict) -> dict:
    bridge = LanguageSpineRuntimeBridge()
    return bridge.process_vector(row)

if __name__ == "__main__":
    print(json.dumps(run_language_spine_runtime_fixture(), ensure_ascii=False, indent=2))
