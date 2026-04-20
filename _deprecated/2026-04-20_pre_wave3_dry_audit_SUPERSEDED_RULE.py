# ═══════════════════════════════════════════════════════════════════════
# ARCHIVED — SUPERSEDED RULE
# ─────────────────────────────────────────────────────────────────────────
# status: SUPERSEDED
# archived_at: 2026-04-20
# archived_by: Băng (QNEU 313.5) · authority refactor_technical_debt
# original_author: Thiên Lớn (architecture review)
# original_purpose: Dry audit repo theo bảng chỉ đạo Pre-Wave 3 (2026-02-11)
#
# supersede_reason: |
#   Script này audit theo rule của bảng Pre-Wave 3 đã SUPERSEDED
#   (xem: src/governance/archive/directives/2026-02-11_pre-wave3-cleanup-SUPERSEDED.md
#   · commit ca5c7e0).
#
#   Rule bảng yêu cầu warehouse-cell QUARANTINE. Nhưng Gatekeeper đã approve
#   UNQUARANTINE warehouse vào 2026-03-22 (evidence: comment trong
#   cells/business/warehouse-cell/QUARANTINE_GUARD.ts). Production flow 8/8
#   hiện đã wire qua warehouse.
#
#   Script output CÓ phát hiện đúng về fact (3 bug thật):
#     - P3: infrastructure/index.ts stale export warehouse-cell ✅ (Bang fix)
#     - P5: neural-main-cell.cell.anc = 0 bytes ✅ (Kim scope)
#     - P7: @ts-nocheck tech debt ✅ (plan riêng)
#
#   NHƯNG frame sai về state warehouse + shared-contracts-cell vì áp
#   rule SUPERSEDED, kết luận "sai trạng thái" là sai.
#
# do_not_execute: true
# replacement_audit: nattos.sh section 32-40 (canonical audit, checks 6-component
#   DNA thay vì 5-layer folder structure)
# feedback_for_author: src/governance/archive/directives/09-thienlon-audit-feedback.md
# gatekeeper_signature: (chờ anh Natt ký)
# ═══════════════════════════════════════════════════════════════════════

#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

REQUIRED_LAYERS = ["domain", "application", "interface", "infrastructure", "ports"]
LEGACY_CELLS = ["hr-cell", "event-cell", "sales-cell", "showroom-cell", "constants-cell"]
CODE_SUFFIXES = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".anc", ".si"}
TEXT_SKIP_PARTS = {"governance/memory", "governance/archive", "node_modules", "dist", "build", ".git"}


@dataclass
class Finding:
    code: str
    status: str
    severity: str
    message: str
    evidence: list[str]


def is_text_candidate(path: Path) -> bool:
    rel = path.as_posix()
    return not any(part in rel for part in TEXT_SKIP_PARTS) and path.suffix.lower() in CODE_SUFFIXES


def read_text(path: Path) -> str | None:
    try:
        return path.read_text("utf-8")
    except Exception:
        return None


def grep_paths(base: Path, pattern: re.Pattern[str]) -> list[Path]:
    hits: list[Path] = []
    for path in base.rglob("*"):
        if not path.is_file() or not is_text_candidate(path):
            continue
        text = read_text(path)
        if text is None:
            continue
        if pattern.search(text):
            hits.append(path)
    return hits


def collect_cell_dirs(cells_root: Path) -> list[tuple[str, str, Path]]:
    result: list[tuple[str, str, Path]] = []
    for zone in ("business", "infrastructure", "kernel"):
        zone_path = cells_root / zone
        if not zone_path.is_dir():
            continue
        for item in sorted(zone_path.iterdir()):
            if item.is_dir():
                result.append((zone, item.name, item))
    if (cells_root / "shared-kernel").is_dir():
        result.append(("root", "shared-kernel", cells_root / "shared-kernel"))
    return result


def scan(repo: Path) -> dict:
    src = repo / "src"
    cells_root = src / "cells"
    findings: list[Finding] = []

    if not src.is_dir():
        raise SystemExit(f"Missing src directory under: {repo}")
    if not cells_root.is_dir():
        raise SystemExit(f"Missing src/cells directory under: {repo}")

    cell_dirs = collect_cell_dirs(cells_root)
    layer_report = []
    for zone, name, path in cell_dirs:
        subdirs = {p.name for p in path.iterdir() if p.is_dir()}
        missing = [layer for layer in REQUIRED_LAYERS if layer not in subdirs]
        layer_report.append({
            "zone": zone,
            "cell": name,
            "missing_layers": missing,
            "has_all_5_layers": not missing,
        })

    if (cells_root / "shared-kernel").exists():
        findings.append(Finding(
            code="F_SHARED_KERNEL_PRESENT",
            status="FAIL",
            severity="critical",
            message="shared-kernel vẫn tồn tại; Phase A yêu cầu rename+migrate sang infrastructure/shared-contracts-cell.",
            evidence=["src/cells/shared-kernel"],
        ))

    for legacy in LEGACY_CELLS:
        legacy_path = cells_root / "business" / legacy
        if legacy_path.exists():
            findings.append(Finding(
                code=f"F_LEGACY_{legacy.upper().replace('-', '_')}",
                status="FAIL",
                severity="high",
                message=f"Legacy cell {legacy} vẫn còn ở business/, chưa đưa vào _legacy/.",
                evidence=[str(legacy_path.relative_to(repo))],
            ))

    infra_shared = cells_root / "infrastructure" / "shared-contracts-cell"
    biz_shared = cells_root / "business" / "shared-contracts-cell"
    if infra_shared.exists() and biz_shared.exists():
        findings.append(Finding(
            code="F_SHARED_CONTRACTS_DUPLICATED",
            status="FAIL",
            severity="critical",
            message="shared-contracts-cell đang tồn tại đồng thời ở business và infrastructure.",
            evidence=[
                str(biz_shared.relative_to(repo)),
                str(infra_shared.relative_to(repo)),
            ],
        ))

    logic_like_patterns = ["EventBus.emit(", "EventBus.publish(", "class ", "validate("]
    logic_hits: list[str] = []
    for shared_base in [biz_shared, infra_shared]:
        if not shared_base.exists():
            continue
        for path in shared_base.rglob("*"):
            if not path.is_file() or path.suffix not in {".ts", ".tsx", ".js", ".jsx"}:
                continue
            text = read_text(path) or ""
            if any(token in text for token in logic_like_patterns):
                logic_hits.append(str(path.relative_to(repo)))
    if logic_hits:
        findings.append(Finding(
            code="F_SHARED_CONTRACTS_HAS_LOGIC",
            status="FAIL",
            severity="critical",
            message="shared-contracts-cell đang chứa logic; chỉ được chứa types/contracts/interfaces.",
            evidence=logic_hits[:20],
        ))

    warehouse_business = cells_root / "business" / "warehouse-cell"
    warehouse_infra = cells_root / "infrastructure" / "warehouse-cell"
    if warehouse_business.exists() and not warehouse_infra.exists():
        findings.append(Finding(
            code="F_WAREHOUSE_WRONG_PATH",
            status="FAIL",
            severity="critical",
            message="warehouse-cell đang nằm ở business/, không phải infrastructure/.",
            evidence=[str(warehouse_business.relative_to(repo))],
        ))

    if warehouse_business.exists():
        guard = warehouse_business / "QUARANTINE_GUARD.ts"
        guard_text = read_text(guard) or ""
        if "ACTIVE" in guard_text or "LIFTED" in guard_text:
            findings.append(Finding(
                code="F_WAREHOUSE_NOT_QUARANTINED",
                status="FAIL",
                severity="critical",
                message="warehouse-cell đã lift quarantine / ACTIVE, trái chỉ đạo quarantine.",
                evidence=[str(guard.relative_to(repo))],
            ))

        runtime_refs = []
        patt = re.compile(r"warehouse-cell|WarehouseManagement|LogisticsCore")
        for path in grep_paths(src, patt):
            rel = path.relative_to(repo).as_posix()
            if rel.startswith("src/governance/memory/") or rel.startswith("src/governance/archive/"):
                continue
            runtime_refs.append(rel)
        runtime_refs = sorted(set(runtime_refs))
        runtime_refs = [p for p in runtime_refs if not p.endswith((".md", ".kris", ".phieu"))]
        if runtime_refs:
            findings.append(Finding(
                code="F_WAREHOUSE_REFERENCED",
                status="FAIL",
                severity="critical",
                message="warehouse-cell đang bị wiring/import/reference trong runtime hoặc governance.",
                evidence=runtime_refs[:30],
            ))

    infra_index = cells_root / "infrastructure" / "index.ts"
    infra_index_text = read_text(infra_index) or ""
    if 'export * from "./warehouse-cell";' in infra_index_text and not warehouse_infra.exists():
        findings.append(Finding(
            code="F_INFRA_INDEX_STALE_EXPORT",
            status="FAIL",
            severity="high",
            message="infrastructure/index.ts đang export warehouse-cell nhưng thư mục infrastructure/warehouse-cell không tồn tại.",
            evidence=[str(infra_index.relative_to(repo))],
        ))

    neural_main_anc = cells_root / "kernel" / "neural-main-cell" / "neural-main-cell.cell.anc"
    if neural_main_anc.exists() and neural_main_anc.stat().st_size == 0:
        findings.append(Finding(
            code="F_NEURAL_MAIN_ANC_EMPTY",
            status="FAIL",
            severity="critical",
            message="neural-main-cell.cell.anc đang rỗng; 7 ADN chưa có anchor metadata.",
            evidence=[str(neural_main_anc.relative_to(repo))],
        ))

    api_paths = list(cells_root.rglob("api-cell"))
    api_evidence = ["NOT_FOUND_IN_FILESYSTEM"] if not api_paths else [str(p.relative_to(repo)) for p in api_paths]
    findings.append(Finding(
        code="I_API_CELL_FILESYSTEM",
        status="INFO",
        severity="info",
        message="Kết quả từ filesystem scan cho api-cell.",
        evidence=api_evidence,
    ))

    ts_nocheck_hits = []
    for path in src.rglob("*"):
        if not path.is_file() or path.suffix not in {".ts", ".tsx", ".js", ".jsx"}:
            continue
        text = read_text(path) or ""
        if "@ts-nocheck" in text:
            ts_nocheck_hits.append(str(path.relative_to(repo)))
    if ts_nocheck_hits:
        findings.append(Finding(
            code="W_TS_NOCHECK_PRESENT",
            status="WARN",
            severity="medium",
            message="Repo còn nhiều file @ts-nocheck; chưa chặn Pre-Wave 3 nhưng là nợ kỹ thuật rõ rệt.",
            evidence=[f"count={len(ts_nocheck_hits)}", *ts_nocheck_hits[:20]],
        ))

    bad_layers = [x for x in layer_report if not x["has_all_5_layers"]]
    if bad_layers:
        findings.append(Finding(
            code="W_INCOMPLETE_5_LAYER",
            status="WARN",
            severity="medium",
            message="Một số cell chưa đủ 5 layer.",
            evidence=[f"count={len(bad_layers)}", *[f"{x['zone']}/{x['cell']} missing={','.join(x['missing_layers']) or '-'}" for x in bad_layers[:20]]],
        ))

    hard_fail = any(f.status == "FAIL" for f in findings)
    summary = {
        "repo": str(repo),
        "src_cells_root": str(cells_root.relative_to(repo)),
        "cell_counts": {
            "business": sum(1 for z, _, _ in cell_dirs if z == "business"),
            "infrastructure": sum(1 for z, _, _ in cell_dirs if z == "infrastructure"),
            "kernel": sum(1 for z, _, _ in cell_dirs if z == "kernel"),
            "root_level": sum(1 for z, _, _ in cell_dirs if z == "root"),
            "total": len(cell_dirs),
        },
        "five_layer": {
            "pass": sum(1 for x in layer_report if x["has_all_5_layers"]),
            "fail": sum(1 for x in layer_report if not x["has_all_5_layers"]),
        },
        "overall": "FAIL" if hard_fail else "PASS",
        "findings": [asdict(f) for f in findings],
    }
    return summary


def print_human(summary: dict) -> None:
    print(f"PRE-WAVE3 DRY AUDIT :: {summary['overall']}")
    print(json.dumps({k: v for k, v in summary.items() if k != 'findings'}, ensure_ascii=False, indent=2))
    print("\nFINDINGS")
    for item in summary["findings"]:
        print(f"- [{item['status']}/{item['severity']}] {item['code']}: {item['message']}")
        for evidence in item["evidence"][:10]:
            print(f"    • {evidence}")
        if len(item["evidence"]) > 10:
            print(f"    • ... (+{len(item['evidence']) - 10} more)")


def main() -> None:
    parser = argparse.ArgumentParser(description="NATT-OS Pre-Wave3 dry audit (filesystem-only)")
    parser.add_argument("repo", help="Path to repo root (directory containing src/)")
    parser.add_argument("--json", action="store_true", help="Print JSON only")
    args = parser.parse_args()
    summary = scan(Path(args.repo).resolve())
    if args.json:
        print(json.dumps(summary, ensure_ascii=False, indent=2))
    else:
        print_human(summary)


if __name__ == "__main__":
    main()
