import json
from pathlib import Path
from runtime_adapter_v0_1 import RuntimeAdapter

VECTORS_PATH = Path("tools/dialect-cipher/numeric_test_vectors_v0_1.json")
OUT_PATH = Path("audit/validators/runtime_adapter_validator_report_v0_1.json")

def main() -> None:
    adapter = RuntimeAdapter()
    vectors = json.loads(VECTORS_PATH.read_text("utf-8"))
    results = []

    for row in vectors["vectors"]:
        frame = adapter.encode_vector(row)
        validation = adapter.validate_frame(frame)
        decoded = adapter.decode(frame)

        checks = {
            "rule_match": frame["rime_rule_id"] == row["rime_rule_id"],
            "color_match": frame["color_class"] == row["color_class"],
            "mirror_match": frame["mirror_class"] == row["mirror_class"],
            "decode_key_match": frame["decode_key"] == row["decode_key"],
            "parity_match": int(frame["parity_bit"]) == int(row["parity_bit"]),
            "decoded_origin_match": decoded["origin_text"] == row["origin_text"],
            "protected_match": bool(frame["protected_flag"]) == bool(row["protected_flag"]),
            "validation_pass": validation["status"] == "PASS",
        }
        if not all(checks.values()):
            raise SystemExit("FAIL: runtime adapter check mismatch for " + row["origin_text"])

        results.append({
            "origin_text": row["origin_text"],
            "status": "PASS",
            "checks": checks,
            "frame": frame,
        })

    report = {
        "schema": "natt-os/runtime-adapter-validator-report/v0.1",
        "status": "PASS",
        "count": len(results),
        "results": results,
    }
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print("RUNTIME_ADAPTER_VALIDATOR_PASS")
    print("REPORT", OUT_PATH)

if __name__ == "__main__":
    main()
