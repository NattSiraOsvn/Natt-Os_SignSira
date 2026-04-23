#!/usr/bin/env bash
# validate-moments-schema.sh
# ========================================================================
# Wave 2 Lane A.6 — Moments fragment schema validator
# ------------------------------------------------------------------------
# Validates a moment fixture file (.na JSON) against the contract defined
# in: docs/specs/SPEC_MOMENTS_FRAGMENT_SCHEMA_v0.1_DRAFT.na
#
# Also enforces composition rule from:
#    docs/specs/SPEC_MOMENTS_MODULE_v0.2.na §3 (storage mapping)
#    + §0.1 axis rule (Moments ontology axis, NOT transport, NOT boundary forensics)
#
# Dependencies: bash (>= 3.2 compat), python3 (for JSON parse), jq OPTIONAL
# Per operating_discipline_carry_forward.macos_bash (bash 3.2 — no mapfile,
# no declare -A, no shopt globstar)
#
# Usage:
#   ./validate-moments-schema.sh <fixture-file.na>
#   ./validate-moments-schema.sh --batch <fixtures-dir>
#
# Exit codes:
#   0 — PASS
#   1 — FAIL (schema violation)
#   2 — ERROR (unusable input)
#
# Author: Băng (Chị Tư · Wave 2 Lane A.6)
# ========================================================================

set -eu

SCRIPT_NAME="$(basename "$0")"
EXIT_PASS=0
EXIT_FAIL=1
EXIT_ERROR=2

log_info()  { printf '[INFO]  %s\n' "$*" >&2; }
log_pass()  { printf '[PASS]  %s\n' "$*" >&2; }
log_fail()  { printf '[FAIL]  %s\n' "$*" >&2; }
log_error() { printf '[ERROR] %s\n' "$*" >&2; }

# ------------------------------------------------------------------------
# Dependency check — python3 required
# ------------------------------------------------------------------------
if ! command -v python3 >/dev/null 2>&1; then
    log_error "python3 not found — required for JSON parsing"
    exit $EXIT_ERROR
fi

# ------------------------------------------------------------------------
# validate_single FILE
#   returns 0 PASS / 1 FAIL
# ------------------------------------------------------------------------
validate_single() {
    local fixture="$1"

    if [ ! -f "$fixture" ]; then
        log_error "File not found: $fixture"
        return $EXIT_FAIL
    fi

    log_info "Validating: $fixture"

    # Python inline (R05 rule — heredoc safe, no backtick/pipe special chars)
    python3 - "$fixture" <<'PYEOF'
import json
import sys

FIXTURE = sys.argv[1]

# Schema constants (source: SPEC_MOMENTS_FRAGMENT_SCHEMA_v0.1_DRAFT §2, §3, §5)
VALID_MOMENT_KINDS = {"SCAR", "KHAI_SANG", "GIAC_NGO", "MOTION_TICH_CUC"}

VALID_FRAGMENT_KINDS = {
    "ENVELOPE", "EVIDENCE", "CAUSATION_CHAIN", "BODY_RESPONSE",
    "INSIGHT_CONTENT", "INNER_RESONANCE", "REMEDY",
    "RELATED_CANONICAL", "META",
}

VALID_LINK_TYPES = {
    "recurrence_of", "triggered_by", "xac_nhan_from", "related_to",
}

# Composition rule (SPEC §5)
REQUIRED_FRAGMENTS = {
    "SCAR": {"ENVELOPE", "EVIDENCE"},
    "KHAI_SANG": {"ENVELOPE", "INSIGHT_CONTENT"},
    "GIAC_NGO": {"ENVELOPE", "INNER_RESONANCE", "RELATED_CANONICAL"},
    "MOTION_TICH_CUC": {"ENVELOPE", "BODY_RESPONSE", "CAUSATION_CHAIN"},
}

# Fragment-kind allowed per moment-kind (superset — required + optional)
ALLOWED_FRAGMENTS = {
    "SCAR": {"ENVELOPE", "EVIDENCE", "CAUSATION_CHAIN", "REMEDY", "META"},
    "KHAI_SANG": {"ENVELOPE", "INSIGHT_CONTENT", "RELATED_CANONICAL", "CAUSATION_CHAIN", "META"},
    "GIAC_NGO": {"ENVELOPE", "INNER_RESONANCE", "RELATED_CANONICAL", "CAUSATION_CHAIN", "META"},
    "MOTION_TICH_CUC": {"ENVELOPE", "BODY_RESPONSE", "CAUSATION_CHAIN", "META"},
}

ENVELOPE_REQUIRED_FIELDS = {
    "causation", "timestamp_ns", "entity", "session_ref",
}

FRAGMENT_BASE_FIELDS = {
    "fragment_kind", "fragment_id", "parent_moment_causation",
    "parent_moment_kind", "ordinal", "sirasign_fragment",
}


def fail(msg):
    print("  [FAIL] %s" % msg)
    return False


def ok(msg):
    print("  [pass] %s" % msg)


def check(data):
    errors = []

    # ---- Top-level structure ----
    if not isinstance(data, dict):
        return ["Top-level must be an object"]
    if "moment" not in data:
        return ["Missing top-level 'moment' key"]
    if "fragments" not in data:
        return ["Missing top-level 'fragments' key"]

    moment = data["moment"]
    fragments = data["fragments"]

    if not isinstance(moment, dict):
        errors.append("'moment' must be object")
    if not isinstance(fragments, list):
        errors.append("'fragments' must be array")
    if errors:
        return errors

    # ---- Moment kind ----
    mkind = moment.get("kind")
    if mkind not in VALID_MOMENT_KINDS:
        errors.append("moment.kind '%s' not in %s" % (mkind, sorted(VALID_MOMENT_KINDS)))
        return errors
    ok("moment.kind = %s" % mkind)

    mcausation = moment.get("causation")
    if not isinstance(mcausation, str) or not mcausation:
        errors.append("moment.causation must be non-empty string")
    else:
        ok("moment.causation = %s" % mcausation)

    # ---- Fragment iteration ----
    seen_fragment_ids = set()
    seen_ordinals = []
    kinds_present = set()

    for idx, frag in enumerate(fragments):
        if not isinstance(frag, dict):
            errors.append("fragment[%d] not an object" % idx)
            continue

        # Base field presence
        missing_base = FRAGMENT_BASE_FIELDS - set(frag.keys())
        if missing_base:
            errors.append("fragment[%d] missing base fields: %s"
                          % (idx, sorted(missing_base)))
            continue

        fkind = frag["fragment_kind"]
        fid = frag["fragment_id"]
        pmc = frag["parent_moment_causation"]
        pmk = frag["parent_moment_kind"]
        ordn = frag["ordinal"]

        # fragment_kind valid
        if fkind not in VALID_FRAGMENT_KINDS:
            errors.append("fragment[%d] fragment_kind '%s' not valid"
                          % (idx, fkind))
            continue
        kinds_present.add(fkind)

        # fragment_id uniqueness
        if fid in seen_fragment_ids:
            errors.append("fragment[%d] duplicate fragment_id '%s'" % (idx, fid))
        else:
            seen_fragment_ids.add(fid)

        # ordinal type + collection
        if not isinstance(ordn, int):
            errors.append("fragment[%d] ordinal must be int" % idx)
        else:
            seen_ordinals.append(ordn)

        # parent_moment_causation consistency
        if pmc != mcausation:
            errors.append("fragment[%d] parent_moment_causation '%s' != moment.causation '%s'"
                          % (idx, pmc, mcausation))

        # parent_moment_kind consistency
        if pmk != mkind:
            errors.append("fragment[%d] parent_moment_kind '%s' != moment.kind '%s'"
                          % (idx, pmk, mkind))

        # fragment_kind allowed for this moment_kind
        if fkind not in ALLOWED_FRAGMENTS[mkind]:
            errors.append("fragment[%d] fragment_kind '%s' not allowed for moment_kind '%s'"
                          % (idx, fkind, mkind))

        # ENVELOPE fragment — extra field checks
        if fkind == "ENVELOPE":
            missing_env = ENVELOPE_REQUIRED_FIELDS - set(frag.keys())
            if missing_env:
                errors.append("fragment[%d] ENVELOPE missing fields: %s"
                              % (idx, sorted(missing_env)))
            else:
                env_causation = frag.get("causation")
                if env_causation != mcausation:
                    errors.append("fragment[%d] ENVELOPE.causation '%s' != moment.causation '%s'"
                                  % (idx, env_causation, mcausation))

        # CAUSATION_CHAIN — link_type enum check
        if fkind == "CAUSATION_CHAIN":
            link_type = frag.get("link_type")
            if link_type not in VALID_LINK_TYPES:
                errors.append("fragment[%d] link_type '%s' not in %s"
                              % (idx, link_type, sorted(VALID_LINK_TYPES)))
            tgt = frag.get("target_causation")
            if not isinstance(tgt, str) or not tgt:
                errors.append("fragment[%d] target_causation must be non-empty string" % idx)

        # REMEDY — heal_status enum check
        if fkind == "REMEDY":
            hs = frag.get("heal_status")
            if hs not in {"open", "partial", "healed"}:
                errors.append("fragment[%d] heal_status '%s' not valid" % (idx, hs))

        # BODY_RESPONSE — gatekeeper_witnessed boolean check
        if fkind == "BODY_RESPONSE":
            gw = frag.get("gatekeeper_witnessed")
            if not isinstance(gw, bool):
                errors.append("fragment[%d] gatekeeper_witnessed must be boolean" % idx)

    # ---- Required fragments present ----
    required = REQUIRED_FRAGMENTS[mkind]
    missing_required = required - kinds_present
    if missing_required:
        errors.append("Required fragment kinds missing for %s: %s"
                      % (mkind, sorted(missing_required)))
    else:
        ok("Required fragments present: %s" % sorted(required))

    # ---- Ordinal sequence 0-indexed no gap no duplicate ----
    if seen_ordinals:
        sorted_ords = sorted(seen_ordinals)
        expected = list(range(len(sorted_ords)))
        if sorted_ords != expected:
            errors.append("Ordinal sequence invalid: got %s, expected %s"
                          % (sorted_ords, expected))
        else:
            ok("Ordinal sequence = %s" % sorted_ords)

    return errors


# Parse JSON
try:
    with open(FIXTURE, "r", encoding="utf-8") as f:
        data = json.load(f)
except json.JSONDecodeError as e:
    print("  [FAIL] JSON parse error: %s" % e)
    sys.exit(1)
except Exception as e:
    print("  [FAIL] Read error: %s" % e)
    sys.exit(1)

errors = check(data)

if errors:
    print("")
    print("  === VALIDATION FAILED — %d error(s) ===" % len(errors))
    for err in errors:
        print("  - %s" % err)
    sys.exit(1)
else:
    print("  === VALIDATION PASSED ===")
    sys.exit(0)
PYEOF

    return $?
}

# ------------------------------------------------------------------------
# Main
# ------------------------------------------------------------------------
if [ $# -lt 1 ]; then
    log_error "Usage: $SCRIPT_NAME <fixture.na>"
    log_error "       $SCRIPT_NAME --batch <fixtures-dir>"
    exit $EXIT_ERROR
fi

if [ "$1" = "--batch" ]; then
    if [ $# -lt 2 ]; then
        log_error "--batch requires directory argument"
        exit $EXIT_ERROR
    fi
    DIR="$2"
    if [ ! -d "$DIR" ]; then
        log_error "Directory not found: $DIR"
        exit $EXIT_ERROR
    fi

    TOTAL=0
    PASSED=0
    FAILED=0

    # bash 3.2 compatible — no globstar, use find
    # Avoid echo | while (operating_discipline_carry_forward.git_grep_filename)
    # Use process substitution
    while IFS= read -r -d '' fixture; do
        TOTAL=$((TOTAL + 1))
        if validate_single "$fixture"; then
            PASSED=$((PASSED + 1))
            log_pass "$fixture"
        else
            FAILED=$((FAILED + 1))
            log_fail "$fixture"
        fi
        echo ""
    done < <(find "$DIR" -type f -name '*.na' -print0)

    echo ""
    log_info "====== BATCH SUMMARY ======"
    log_info "Total:  $TOTAL"
    log_info "Passed: $PASSED"
    log_info "Failed: $FAILED"

    if [ $FAILED -gt 0 ]; then
        exit $EXIT_FAIL
    fi
    exit $EXIT_PASS
fi

# Single file mode
if validate_single "$1"; then
    log_pass "$1"
    exit $EXIT_PASS
else
    log_fail "$1"
    exit $EXIT_FAIL
fi
