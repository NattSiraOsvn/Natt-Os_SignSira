import json
from pathlib import Path
from importlib.util import spec_from_file_location, module_from_spec

ENTRY_PATH = Path("src/cells/kernel/khai-cell/application/language_spine_runtime_entry.py")
OUT_PATH = Path("audit/validators/runtime_entry_validator_report_v0_1.json")

def load_entry():
    spec = spec_from_file_location("language_spine_runtime_entry", ENTRY_PATH)
    mod = module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def main() -> None:
    entry = load_entry()
    report = entry.run_language_spine_runtime_fixture()
    if report["status"] != "PASS":
        raise SystemExit("FAIL: runtime entry status not PASS")
    for row in report["results"]:
        if row["adapter_validation"]["status"] != "PASS":
            raise SystemExit("FAIL: adapter validation failed for " + row["origin_text"])
        if row["hardware_validation"]["status"] != "PASS":
            raise SystemExit("FAIL: hardware validation failed for " + row["origin_text"])
        if row["frame"]["decode_key"] != row["adapter_validation"]["decode_key"]:
            raise SystemExit("FAIL: adapter decode_key mismatch for " + row["origin_text"])
        if row["frame"]["decode_key"] != row["hardware_validation"]["decode_key"]:
            raise SystemExit("FAIL: hardware decode_key mismatch for " + row["origin_text"])
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print("RUNTIME_ENTRY_PASS")
    print("REPORT", OUT_PATH)

if __name__ == "__main__":
    main()
