from __future__ import annotations
import argparse
import json
import re
from pathlib import Path

BEGIN = "# === LANGUAGE SPINE VOCAB v0.1 BEGIN ==="
END = "# === LANGUAGE SPINE VOCAB v0.1 END ==="

def load_json(path: Path) -> dict:
    if not path.exists():
        return {"rules": [], "protected_tokens": []}
    return json.loads(path.read_text("utf-8"))

def save_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf-8")

def find_thienbang(root: Path) -> Path:
    p = root / "src/thienbang.si"
    if not p.exists():
        raise SystemExit("MISSING src/thienbang.si")
    return p

def parse_existing_block(text: str) -> dict:
    out = {"rules": [], "protected_tokens": []}
    if BEGIN not in text or END not in text:
        return out
    block = text.split(BEGIN, 1)[1].split(END, 1)[0]
    section = ""
    for raw in block.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("dialect_rules:"):
            section = "rules"
            continue
        if line.startswith("protected_tokens:"):
            section = "protected_tokens"
            continue
        if not line.startswith("- "):
            continue
        body = line[2:]
        if section == "rules":
            parts = [x.strip() for x in body.split("|")]
            row = {"rule_id": parts[0], "namespace": "", "prefix": "", "from": "", "to": "", "idx": 9999}
            for item in parts[1:]:
                if "=" not in item:
                    continue
                k, v = [x.strip() for x in item.split("=", 1)]
                if k == "ns":
                    row["namespace"] = v
                elif k == "prefix":
                    row["prefix"] = v
                elif k == "from":
                    row["from"] = v
                elif k == "to":
                    row["to"] = v
                elif k == "idx":
                    try:
                        row["idx"] = int(v)
                    except Exception:
                        row["idx"] = 9999
            out["rules"].append(row)
        elif section == "protected_tokens":
            token = body.split("|", 1)[0].strip()
            if token:
                out["protected_tokens"].append(token)
    return out

def merge(existing: dict, overlay: dict) -> dict:
    seen_rules = {}
    for row in existing.get("rules", []):
        seen_rules[row["rule_id"]] = dict(row)
    for row in overlay.get("rules", []):
        seen_rules[row["rule_id"]] = dict(row)
    rules = sorted(seen_rules.values(), key=lambda x: (int(x.get("idx", 9999)), x["rule_id"]))

    tokens = []
    seen_tokens = set()
    for token in existing.get("protected_tokens", []) + overlay.get("protected_tokens", []):
        if token not in seen_tokens:
            seen_tokens.add(token)
            tokens.append(token)

    return {"rules": rules, "protected_tokens": tokens}

def render_block(data: dict) -> str:
    lines = []
    lines.append(BEGIN)
    lines.append("## LANGUAGE SPINE VOCAB v0.1")
    lines.append("## merged from existing thienbang block + vocab overlay")
    lines.append("")
    lines.append("dialect_rules:")
    for row in data.get("rules", []):
        lines.append(f"- {row[rule_id]} | ns={row[namespace]} | prefix={row[prefix]} | from={row[from]} | to={row[to]} | idx={row[idx]}")
    lines.append("")
    lines.append("protected_tokens:")
    for token in data.get("protected_tokens", []):
        lines.append(f"- {token} | rule=R_PROTECTED | tone=CTRL_ESCAPE | color=C6 | protected=true")
    lines.append(END)
    return "\n".join(lines)

def rebuild(root: Path, store_path: Path) -> None:
    thienbang = find_thienbang(root)
    text = thienbang.read_text("utf-8")
    existing = parse_existing_block(text)
    overlay = load_json(store_path)
    merged = merge(existing, overlay)
    new_block = render_block(merged)
    if BEGIN in text and END in text:
        head = text.split(BEGIN, 1)[0].rstrip()
        tail = text.split(END, 1)[1].lstrip("\n")
        new_text = head + "\n\n" + new_block + "\n" + tail
    else:
        new_text = text.rstrip() + "\n\n" + new_block + "\n"
    thienbang.write_text(new_text, "utf-8")
    print("REBUILT", thienbang)
    print("RULES", len(merged["rules"]))
    print("PROTECTED", len(merged["protected_tokens"]))

def add_protected(store_path: Path, token: str) -> None:
    data = load_json(store_path)
    if token not in data["protected_tokens"]:
        data["protected_tokens"].append(token)
    save_json(store_path, data)
    print("ADDED_PROTECTED", token)

def add_rule(store_path: Path, rule_id: str, namespace: str, prefix: str, src_val: str, dst_val: str, idx: int) -> None:
    data = load_json(store_path)
    rows = [r for r in data["rules"] if r["rule_id"] != rule_id]
    rows.append({
        "rule_id": rule_id,
        "namespace": namespace,
        "prefix": prefix,
        "from": src_val,
        "to": dst_val,
        "idx": int(idx)
    })
    data["rules"] = sorted(rows, key=lambda x: (int(x["idx"]), x["rule_id"]))
    save_json(store_path, data)
    print("ADDED_RULE", rule_id)

def apply_patch(store_path: Path, patch_path: Path) -> None:
    data = load_json(store_path)
    rule_map = {r["rule_id"]: dict(r) for r in data["rules"]}
    token_set = list(data["protected_tokens"])
    for raw in patch_path.read_text("utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        parts = [x.strip() for x in line.split("|")]
        kind = parts[0].upper()
        if kind == "PROTECTED" and len(parts) >= 2:
            token = parts[1]
            if token not in token_set:
                token_set.append(token)
        elif kind == "RULE" and len(parts) >= 7:
            rule_map[parts[1]] = {
                "rule_id": parts[1],
                "namespace": parts[2],
                "prefix": parts[3],
                "from": parts[4],
                "to": parts[5],
                "idx": int(parts[6])
            }
    data["rules"] = sorted(rule_map.values(), key=lambda x: (int(x["idx"]), x["rule_id"]))
    data["protected_tokens"] = token_set
    save_json(store_path, data)
    print("APPLIED_PATCH", patch_path)

def show(root: Path, store_path: Path) -> None:
    thienbang = find_thienbang(root)
    data = load_json(store_path)
    print("THIENBANG", thienbang)
    print("STORE", store_path)
    print("RULES", len(data["rules"]))
    print("PROTECTED", len(data["protected_tokens"]))
    for row in data["rules"]:
        print("RULE", row["rule_id"], row["namespace"], row["prefix"], row["from"], row["to"], row["idx"])
    for token in data["protected_tokens"]:
        print("TOKEN", token)

def main() -> None:
    root = Path(__file__).resolve().parents[2]
    store_path = root / "tools/dialect-cipher/vocab_overlay_v0_1.json"

    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    sub.add_parser("show")

    p1 = sub.add_parser("add-protected")
    p1.add_argument("token")

    p2 = sub.add_parser("add-rule")
    p2.add_argument("rule_id")
    p2.add_argument("namespace")
    p2.add_argument("prefix")
    p2.add_argument("src_val")
    p2.add_argument("dst_val")
    p2.add_argument("idx", type=int)

    p3 = sub.add_parser("apply-patch")
    p3.add_argument("patch_path")

    sub.add_parser("rebuild")

    args = ap.parse_args()

    if args.cmd == "show":
        show(root, store_path)
    elif args.cmd == "add-protected":
        add_protected(store_path, args.token)
    elif args.cmd == "add-rule":
        add_rule(store_path, args.rule_id, args.namespace, args.prefix, args.src_val, args.dst_val, args.idx)
    elif args.cmd == "apply-patch":
        apply_patch(store_path, Path(args.patch_path))
    elif args.cmd == "rebuild":
        rebuild(root, store_path)

if __name__ == "__main__":
    main()
