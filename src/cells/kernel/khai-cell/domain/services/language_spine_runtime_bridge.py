import json
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

def _find_repo_root() -> Path:
    p = Path(__file__).resolve()
    for base in [p] + list(p.parents):
        if (base / "tools/dialect-cipher/runtime_adapter_v0_1.py").exists() and (base / "tools/hardware-dialect-translator/hardware_translator_v0_1.py").exists():
            return base
    raise RuntimeError("repo root not found")

REPO_ROOT = _find_repo_root()
RUNTIME_ADAPTER_PATH = REPO_ROOT / "tools/dialect-cipher/runtime_adapter_v0_1.py"
HARDWARE_TRANSLATOR_PATH = REPO_ROOT / "tools/hardware-dialect-translator/hardware_translator_v0_1.py"
VECTORS_PATH = REPO_ROOT / "tools/dialect-cipher/numeric_test_vectors_v0_1.json"

def _load_module(path: Path, module_name: str):
    spec = spec_from_file_location(module_name, path)
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

RuntimeAdapter = _load_module(RUNTIME_ADAPTER_PATH, "runtime_adapter_v0_1").RuntimeAdapter
HardwareTranslator = _load_module(HARDWARE_TRANSLATOR_PATH, "hardware_translator_v0_1").HardwareTranslator

class LanguageSpineRuntimeBridge:
    def __init__(self) -> None:
        self.adapter = RuntimeAdapter()
        self.hardware = HardwareTranslator()

    def process_vector(self, vector: dict) -> dict:
        frame = self.adapter.encode_vector(vector)
        adapter_validation = self.adapter.validate_frame(frame)
        translated = self.hardware.translate_vector(vector)
        return {
            "origin_text": vector["origin_text"],
            "frame": frame,
            "adapter_validation": adapter_validation,
            "hardware_signal": translated["signal"],
            "hardware_readback": translated["readback"],
            "hardware_validation": translated["validation"],
        }

    def process_vectors(self, vectors: list[dict]) -> dict:
        results = [self.process_vector(v) for v in vectors]
        return {
            "schema": "natt-os/runtime-cell-integration/v0.1",
            "status": "PASS",
            "count": len(results),
            "results": results,
        }

    def process_fixture_file(self, path: Path = VECTORS_PATH) -> dict:
        doc = json.loads(path.read_text("utf-8"))
        return self.process_vectors(doc["vectors"])
