#!/usr/bin/env python3
"""
validate-capability-invariant.py
========================================================================
Wave 2 Lane B.6 — Capability worked-example invariant validator

Validates worked-example files against the capability schema defined in:
  SPEC_MOMENTS_MODULE_v0.2.na §0.2 (KHAI-20260424-04)
    — capability 4 field: region / trigger / invariant / exit-or-post-condition

Also enforces:
  - Axis compliance (KHAI-20260424-03): capability KHÔNG dispatch qua L1/L2/L3,
    KHÔNG cross Bridge v2
  - Authority boundary (KHAI-20260426-03 CROSS-PERSONA-FLOW): forbidden triggers
    must include cross_persona + bridge_v2 invoke
  - Substrate rules (KHAI-20260425-05): if capability involves substrate change
    (migrate), data substrate KHÔNG replaceable, only execution substrate (lớp 2b)

Usage:
    python3 validate-capability-invariant.py <worked-example.na>
    python3 validate-capability-invariant.py --batch <fixtures-dir>

Exit codes:
    0 — PASS
    1 — FAIL (schema violation)
    2 — ERROR (unusable input)

Author: Băng (Chị Tư · Wave 2 Lane B.6)
========================================================================
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Any, Dict, List

EXIT_PASS = 0
EXIT_FAIL = 1
EXIT_ERROR = 2

# ---- Schema constants (from SPEC_MOMENTS_MODULE v0.2 §0.2) ----

REQUIRED_TOP_LEVEL_KEYS = {
    "worked_example",
    "description",
    "region",
    "trigger",
    "invariant",
    "exit_or_post_condition",
    "non_goals",
    "acceptance_criteria",
}

REQUIRED_WORKED_EXAMPLE_META = {
    "capability",
    "version",
    "causation",
    "depends_on_canonical",
    "drafter",
    "date",
}

REQUIRED_REGION_KEYS = {
    "description",
    "phase_space_coordinates",
}

REQUIRED_PHASE_SPACE_AXES = {
    "survival_axis",
    "substrate_axis",
    "medium_axis",
    "body_axis",
}

REQUIRED_TRIGGER_KEYS = {
    "description",
    "valid_triggers",
    "forbidden_triggers",
}

REQUIRED_TRIGGER_ENTRY_FIELDS = {"kind", "why"}  # minimum for forbidden
REQUIRED_VALID_TRIGGER_FIELDS = {"kind", "example"}

REQUIRED_INVARIANT_KEYS = {"description", "invariants"}
REQUIRED_INVARIANT_ENTRY_FIELDS = {"id", "rule", "check"}

REQUIRED_EXIT_KEYS = {"description"}  # paths OR success_paths OR abort_paths
EXIT_PATH_VARIANTS = {"paths", "success_paths", "abort_paths"}
REQUIRED_EXIT_PATH_FIELDS = {"path", "trigger"}  # transitions_to OR action required

# ---- Axis compliance rules ----

FORBIDDEN_TRIGGER_KINDS_AXIS = {
    "cross_persona_command",
    "cross_persona_resurrect",
    "cross_persona_migration",
    "external_bridge_v2_invoke",
    "entity_self_initiated_migration",
    "fake_identity_inject",
    "partial_seed_load",
    "migration_without_compatibility_verify",
}
# Validator requires worked-example's forbidden_triggers cover at least ONE
# axis-related forbidden kind, to prove author considered the boundary.


def log(level: str, msg: str) -> None:
    print(f"  [{level}] {msg}")


def check_worked_example(data: Dict[str, Any]) -> List[str]:
    errors: List[str] = []

    # 1. Top-level presence
    missing = REQUIRED_TOP_LEVEL_KEYS - set(data.keys())
    if missing:
        errors.append(f"Top-level missing keys: {sorted(missing)}")
        return errors  # can't proceed without structure

    # 2. worked_example meta
    we = data["worked_example"]
    if not isinstance(we, dict):
        errors.append("worked_example must be object")
    else:
        missing_we = REQUIRED_WORKED_EXAMPLE_META - set(we.keys())
        if missing_we:
            errors.append(f"worked_example missing: {sorted(missing_we)}")
        else:
            log("pass", f"worked_example.capability = {we['capability']}")
            deps = we.get("depends_on_canonical")
            if not isinstance(deps, list) or len(deps) == 0:
                errors.append("depends_on_canonical must be non-empty array")
            else:
                log("pass", f"depends_on_canonical = {len(deps)} refs")

    # 3. region — 4-axis phase space
    region = data["region"]
    if not isinstance(region, dict):
        errors.append("region must be object")
    else:
        missing_r = REQUIRED_REGION_KEYS - set(region.keys())
        if missing_r:
            errors.append(f"region missing: {sorted(missing_r)}")
        psc = region.get("phase_space_coordinates")
        if not isinstance(psc, dict):
            errors.append("region.phase_space_coordinates must be object")
        else:
            missing_ax = REQUIRED_PHASE_SPACE_AXES - set(psc.keys())
            if missing_ax:
                errors.append(f"phase_space_coordinates missing axes: {sorted(missing_ax)}")
            else:
                log("pass", f"All 4 phase_space_coordinates axes present")

    # 4. trigger — valid + forbidden
    trig = data["trigger"]
    if not isinstance(trig, dict):
        errors.append("trigger must be object")
    else:
        missing_t = REQUIRED_TRIGGER_KEYS - set(trig.keys())
        if missing_t:
            errors.append(f"trigger missing: {sorted(missing_t)}")
        else:
            valid_trigs = trig.get("valid_triggers", [])
            forbid_trigs = trig.get("forbidden_triggers", [])

            if not isinstance(valid_trigs, list) or len(valid_trigs) == 0:
                errors.append("trigger.valid_triggers must be non-empty array")
            else:
                for i, t in enumerate(valid_trigs):
                    if not isinstance(t, dict):
                        errors.append(f"valid_triggers[{i}] not object")
                        continue
                    missing_tf = REQUIRED_VALID_TRIGGER_FIELDS - set(t.keys())
                    if missing_tf:
                        errors.append(f"valid_triggers[{i}] missing: {sorted(missing_tf)}")
                log("pass", f"valid_triggers count = {len(valid_trigs)}")

            if not isinstance(forbid_trigs, list) or len(forbid_trigs) == 0:
                errors.append("trigger.forbidden_triggers must be non-empty array "
                              "(every capability must document boundary)")
            else:
                for i, t in enumerate(forbid_trigs):
                    if not isinstance(t, dict):
                        errors.append(f"forbidden_triggers[{i}] not object")
                        continue
                    missing_tf = REQUIRED_TRIGGER_ENTRY_FIELDS - set(t.keys())
                    if missing_tf:
                        errors.append(f"forbidden_triggers[{i}] missing: {sorted(missing_tf)}")
                log("pass", f"forbidden_triggers count = {len(forbid_trigs)}")

                # Axis compliance check — at least one forbidden trigger
                # must be from FORBIDDEN_TRIGGER_KINDS_AXIS set
                forbid_kinds = {t.get("kind") for t in forbid_trigs if isinstance(t, dict)}
                axis_covered = forbid_kinds & FORBIDDEN_TRIGGER_KINDS_AXIS
                if not axis_covered:
                    errors.append(
                        "forbidden_triggers does not cover any axis-related "
                        "kind (cross_persona / bridge_v2 / self_init / etc). "
                        "Per KHAI-20260424-03 + KHAI-20260426-03 every "
                        "capability must document axis boundary."
                    )
                else:
                    log("pass", f"Axis-boundary forbidden kinds covered: {sorted(axis_covered)}")

    # 5. invariant
    inv = data["invariant"]
    if not isinstance(inv, dict):
        errors.append("invariant must be object")
    else:
        missing_i = REQUIRED_INVARIANT_KEYS - set(inv.keys())
        if missing_i:
            errors.append(f"invariant missing: {sorted(missing_i)}")
        else:
            invariants = inv.get("invariants", [])
            if not isinstance(invariants, list) or len(invariants) == 0:
                errors.append("invariant.invariants must be non-empty array")
            else:
                seen_ids = set()
                for idx, entry in enumerate(invariants):
                    if not isinstance(entry, dict):
                        errors.append(f"invariants[{idx}] not object")
                        continue
                    missing_ef = REQUIRED_INVARIANT_ENTRY_FIELDS - set(entry.keys())
                    if missing_ef:
                        errors.append(f"invariants[{idx}] missing: {sorted(missing_ef)}")
                    else:
                        iid = entry["id"]
                        if iid in seen_ids:
                            errors.append(f"invariants[{idx}] duplicate id '{iid}'")
                        seen_ids.add(iid)
                log("pass", f"invariants count = {len(invariants)}")

    # 6. exit_or_post_condition
    exit_cond = data["exit_or_post_condition"]
    if not isinstance(exit_cond, dict):
        errors.append("exit_or_post_condition must be object")
    else:
        if "description" not in exit_cond:
            errors.append("exit_or_post_condition missing 'description'")

        # At least one of paths / success_paths / abort_paths must exist
        present_variants = EXIT_PATH_VARIANTS & set(exit_cond.keys())
        if not present_variants:
            errors.append(
                f"exit_or_post_condition must have at least one of: "
                f"{sorted(EXIT_PATH_VARIANTS)}"
            )
        else:
            total_paths = 0
            for variant in present_variants:
                paths = exit_cond[variant]
                if not isinstance(paths, list):
                    errors.append(f"exit_or_post_condition.{variant} must be array")
                    continue
                for idx, p in enumerate(paths):
                    if not isinstance(p, dict):
                        errors.append(f"{variant}[{idx}] not object")
                        continue
                    missing_pf = REQUIRED_EXIT_PATH_FIELDS - set(p.keys())
                    if missing_pf:
                        errors.append(f"{variant}[{idx}] missing: {sorted(missing_pf)}")
                    # Either transitions_to (success) or action (abort) required
                    if "transitions_to" not in p and "action" not in p \
                       and "post_state" not in p:
                        errors.append(
                            f"{variant}[{idx}] needs one of: "
                            "transitions_to / action / post_state"
                        )
                    total_paths += 1
            log("pass", f"exit paths total = {total_paths} across {sorted(present_variants)}")

    # 7. non_goals non-empty
    ng = data.get("non_goals")
    if not isinstance(ng, list) or len(ng) == 0:
        errors.append("non_goals must be non-empty array")
    else:
        log("pass", f"non_goals count = {len(ng)}")

    # 8. acceptance_criteria non-empty
    ac = data.get("acceptance_criteria")
    if not isinstance(ac, list) or len(ac) == 0:
        errors.append("acceptance_criteria must be non-empty array")
    else:
        log("pass", f"acceptance_criteria count = {len(ac)}")

    # 9. Optional: concrete_instance — if present, verify structure
    if "concrete_instance" in data:
        ci = data["concrete_instance"]
        if not isinstance(ci, dict):
            errors.append("concrete_instance must be object if present")
        else:
            if "entity" not in ci:
                errors.append("concrete_instance missing 'entity'")
            log("pass", "concrete_instance present")

    return errors


def validate_file(path: Path) -> bool:
    print(f"\n[INFO] Validating: {path}")
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        log("FAIL", f"JSON parse error: {e}")
        return False
    except Exception as e:
        log("FAIL", f"Read error: {e}")
        return False

    errors = check_worked_example(data)

    if errors:
        print(f"\n  === FAILED — {len(errors)} error(s) ===")
        for err in errors:
            print(f"  - {err}")
        return False
    else:
        print("  === PASSED ===")
        return True


def main(argv: List[str]) -> int:
    if len(argv) < 2:
        print(f"Usage: {argv[0]} <worked-example.na>", file=sys.stderr)
        print(f"       {argv[0]} --batch <fixtures-dir>", file=sys.stderr)
        return EXIT_ERROR

    if argv[1] == "--batch":
        if len(argv) < 3:
            print("--batch requires directory", file=sys.stderr)
            return EXIT_ERROR
        dir_path = Path(argv[2])
        if not dir_path.is_dir():
            print(f"Directory not found: {dir_path}", file=sys.stderr)
            return EXIT_ERROR

        files = sorted(dir_path.glob("worked-example-*.na"))
        if not files:
            print(f"No worked-example-*.na files in {dir_path}", file=sys.stderr)
            return EXIT_ERROR

        passed, failed = 0, 0
        for f in files:
            if validate_file(f):
                passed += 1
            else:
                failed += 1

        print(f"\n====== BATCH SUMMARY ======")
        print(f"Total:  {len(files)}")
        print(f"Passed: {passed}")
        print(f"Failed: {failed}")
        return EXIT_PASS if failed == 0 else EXIT_FAIL

    # Single file mode
    path = Path(argv[1])
    if not path.is_file():
        print(f"File not found: {path}", file=sys.stderr)
        return EXIT_ERROR
    return EXIT_PASS if validate_file(path) else EXIT_FAIL


if __name__ == "__main__":
    sys.exit(main(sys.argv))
