import json
from pathlib import Path

def fail(msg: str) -> None:
    print("FAIL:", msg)
    raise SystemExit(1)

def ok(msg: str) -> None:
    print("OK:", msg)

root = Path(".")
spec_idx = (root / "docs/specs/SPEC_LANGUAGE_SPINE_INDEX_v0.1.bang").read_text("utf-8")
spec_num = (root / "docs/specs/SPEC_NUMERIC_NFD_FRAME_v0.1.bang").read_text("utf-8")
rules = json.loads((root / "src/governance/registry/dialect_rules_v0_1.na").read_text("utf-8"))
prot = json.loads((root / "src/governance/registry/protected_tokens_v0_1.na").read_text("utf-8"))
vecs = json.loads((root / "tools/dialect-cipher/numeric_test_vectors_v0_1.json").read_text("utf-8"))

required_spec_snippets = [
    "C1 = sắc",
    "C2 = huyền",
    "R_PROTECTED",
    "row_hmac",
    "NATT-NUMERIC-FRAME-v0.1",
]
for s in required_spec_snippets:
    if s not in spec_idx and s not in spec_num:
        fail(f"missing spec snippet: {s}")
ok("spec snippets present")

required_rules = ["RN_UOI_UI", "R_TONE_ONLY", "R_PROTECTED"]
rule_map = {}
for row in rules["rules"]:
    rule_map[row["rime_rule_id"]] = row
for rid in required_rules:
    if rid not in rule_map:
        fail(f"missing rule: {rid}")
ok("required rules present")

if rules["color_truth"]["C1"] != "sac":
    fail("C1 must map to sac")
if rules["color_truth"]["C2"] != "huyen":
    fail("C2 must map to huyen")
if rules["color_truth"]["C6"] != "escape_protected":
    fail("C6 must map to escape_protected")
if rules["color_truth"]["C7"] != "parity_resync":
    fail("C7 must map to parity_resync")
ok("color truth locked")

prot_required = {"NATT-OS", "Mạch HeyNa", ".anc", ".si", ".na", ".bang"}
prot_tokens = {row["token"] for row in prot["records"]}
missing = sorted(prot_required - prot_tokens)
if missing:
    fail("missing protected tokens: " + ", ".join(missing))
for row in prot["records"]:
    if row["rime_rule_id"] != "R_PROTECTED":
        fail("protected record without R_PROTECTED: " + row["token"])
    if row["tone_code"] != "CTRL_ESCAPE":
        fail("protected record without CTRL_ESCAPE: " + row["token"])
    if row["color_class"] != "C6":
        fail("protected record without C6: " + row["token"])
    if row["protected_flag"] is not True:
        fail("protected_flag false: " + row["token"])
ok("protected registry valid")

rule_index = {row["rime_rule_id"]: int(row["rime_rule_index"]) for row in rules["rules"]}
for row in vecs["vectors"]:
    rid = row["rime_rule_id"]
    if rid not in rule_index:
        fail("vector references unknown rule: " + rid)
    if int(row["rime_rule_index"]) != int(rule_index[rid]):
        fail("rime_rule_index mismatch for: " + row["origin_text"])
    color_index = int(str(row["color_class"]).replace("C", ""))
    polarity_bit = 1 if row.get("polarity") == "INVERTED" else 0
    expected = (int(row["rime_rule_index"]) ^ int(row["tone_index"]) ^ color_index ^ polarity_bit) % 2
    if int(row["parity_bit"]) != expected:
        fail("parity mismatch for: " + row["origin_text"])
    if rid == "R_PROTECTED" and row["color_class"] != "C6":
        fail("protected vector without C6: " + row["origin_text"])
ok("numeric vectors valid")

out = root / "audit/validators/language_spine_validator_report_v0_1.json"
out.parent.mkdir(parents=True, exist_ok=True)
report = {
    "schema": "natt-os/language-spine-validator-report/v0.1",
    "status": "PASS",
    "files": [
        "docs/specs/SPEC_LANGUAGE_SPINE_INDEX_v0.1.bang",
        "docs/specs/SPEC_NUMERIC_NFD_FRAME_v0.1.bang",
        "src/governance/registry/dialect_rules_v0_1.na",
        "src/governance/registry/protected_tokens_v0_1.na",
        "tools/dialect-cipher/numeric_test_vectors_v0_1.json",
    ],
    "checks": {
        "spec_snippets": "PASS",
        "required_rules": "PASS",
        "color_truth": "PASS",
        "protected_registry": "PASS",
        "numeric_vectors": "PASS",
    },
}
out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8")
ok("report written: " + str(out))
print("LANGUAGE_SPINE_VALIDATOR_PASS")
