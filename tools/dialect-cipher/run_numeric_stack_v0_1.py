import json
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

ROOT = Path(__file__).resolve().parents[2]

def load_module(path: Path, name: str):
    spec = spec_from_file_location(name, path)
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def main() -> None:
    rules = json.loads((ROOT / "src/governance/registry/dialect_rules_v0_1.na").read_text("utf-8"))
    protected = json.loads((ROOT / "src/governance/registry/protected_tokens_v0_1.na").read_text("utf-8"))
    vectors = json.loads((ROOT / "tools/dialect-cipher/numeric_test_vectors_v0_1.json").read_text("utf-8"))

    runtime_mod = load_module(ROOT / "tools/dialect-cipher/runtime_adapter_v0_1.py", "runtime_adapter_v0_1")
    hw_mod = load_module(ROOT / "tools/hardware-dialect-translator/hardware_translator_v0_1.py", "hardware_translator_v0_1")
    bridge_mod = load_module(ROOT / "src/cells/kernel/khai-cell/domain/services/language_spine_runtime_bridge.py", "language_spine_runtime_bridge")

    runtime = runtime_mod.RuntimeAdapter()
    hardware = hw_mod.HardwareTranslator()
    bridge = bridge_mod.LanguageSpineRuntimeBridge()

    rows = []
    for row in vectors["vectors"]:
        frame = runtime.encode_vector(row)
        runtime_ok = runtime.validate_frame(frame)
        hw = hardware.translate_vector(row)
        bridge_row = bridge.process_vector(row)

        checks = {
            "runtime_pass": runtime_ok["status"] == "PASS",
            "hardware_pass": hw["validation"]["status"] == "PASS",
            "bridge_adapter_pass": bridge_row["adapter_validation"]["status"] == "PASS",
            "bridge_hardware_pass": bridge_row["hardware_validation"]["status"] == "PASS",
            "decode_key_consistent": frame["decode_key"] == hw["frame"]["decode_key"] == bridge_row["frame"]["decode_key"],
            "color_consistent": frame["color_class"] == hw["signal"]["color_class"] == bridge_row["hardware_signal"]["color_class"],
            "mirror_consistent": frame["mirror_class"] == hw["signal"]["mirror_class"] == bridge_row["hardware_signal"]["mirror_class"],
            "protected_consistent": bool(frame["protected_flag"]) == bool(hw["signal"]["protected_flag"]) == bool(bridge_row["frame"]["protected_flag"]),
        }
        if not all(checks.values()):
            raise SystemExit("FAIL: numeric stack mismatch for " + row["origin_text"])

        rows.append({
            "origin_text": row["origin_text"],
            "status": "PASS",
            "checks": checks,
            "frame": frame,
            "hardware_signal": hw["signal"],
            "hardware_readback": hw["readback"],
            "bridge": bridge_row,
        })

    report = {
        "schema": "natt-os/numeric-stack-report/v0.1",
        "status": "PASS",
        "count": len(rows),
        "layers": {
            "rules": len(rules["rules"]),
            "protected_tokens": len(protected["records"]),
            "vectors": len(vectors["vectors"]),
            "runtime_adapter": "PASS",
            "hardware_translator": "PASS",
            "runtime_bridge": "PASS",
        },
        "results": rows,
    }

    out = ROOT / "audit/validators/numeric_stack_report_v0_1.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print("NUMERIC_STACK_PASS")
    print("REPORT", out)

if __name__ == "__main__":
    main()
