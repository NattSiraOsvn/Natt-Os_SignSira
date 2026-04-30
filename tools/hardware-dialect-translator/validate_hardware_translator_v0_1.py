import json
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

TRANSLATOR_PATH = Path("tools/hardware-dialect-translator/hardware_translator_v0_1.py")
VECTORS_PATH = Path("tools/dialect-cipher/numeric_test_vectors_v0_1.json")
OUT_PATH = Path("audit/validators/hardware_translator_validator_report_v0_1.json")

def load_translator():
    spec = spec_from_file_location("hardware_translator_v0_1", TRANSLATOR_PATH)
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.HardwareTranslator

def main() -> None:
    HardwareTranslator = load_translator()
    translator = HardwareTranslator()
    vectors = json.loads(VECTORS_PATH.read_text("utf-8"))
    results = []
    for row in vectors["vectors"]:
        out = translator.translate_vector(row)
        frame = out["frame"]
        signal = out["signal"]
        readback = out["readback"]
        checks = {
            "color_roundtrip": signal["color_class"] == readback["read_color_class"] == row["color_class"],
            "mirror_roundtrip": signal["mirror_class"] == readback["read_mirror_class"] == row["mirror_class"],
            "parity_roundtrip": int(signal["parity_bit"]) == int(readback["read_parity_bit"]) == int(row["parity_bit"]),
            "protected_roundtrip": bool(signal["protected_flag"]) == bool(readback["protected_flag"]) == bool(row["protected_flag"]),
            "decode_key_match": frame["decode_key"] == row["decode_key"],
            "validation_pass": out["validation"]["status"] == "PASS",
        }
        if not all(checks.values()):
            raise SystemExit("FAIL: hardware translator mismatch for " + row["origin_text"])
        results.append({
            "origin_text": row["origin_text"],
            "status": "PASS",
            "checks": checks,
            "frame": frame,
            "signal": signal,
            "readback": readback,
        })
    report = {
        "schema": "natt-os/hardware-translator-validator-report/v0.1",
        "status": "PASS",
        "count": len(results),
        "results": results,
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print("HARDWARE_TRANSLATOR_VALIDATOR_PASS")
    print("REPORT", OUT_PATH)

if __name__ == "__main__":
    main()
