#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import unicodedata
from pathlib import Path

TONE_CLASS = {
    "acute": "C1",
    "grave": "C2",
    "hook": "C3",
    "tilde": "C4",
    "dot": "C5",
    "none": "C0",
}

PROTECTED_SUFFIXES = {".anc", ".si", ".phieu", ".bang"}
TEXT_SUFFIXES = {".na", ".md", ".txt", ".kris", ".ml"}

def strip_vietnamese_tone(s: str) -> str:
    decomposed = unicodedata.normalize("NFD", s)
    out = []
    for ch in decomposed:
        if unicodedata.category(ch) == "Mn":
            continue
        out.append(ch)
    return unicodedata.normalize("NFC", "".join(out)).replace("đ", "d").replace("Đ", "D")

def detect_tone(token: str) -> str:
    d = unicodedata.normalize("NFD", token)
    for ch in d:
        name = unicodedata.name(ch, "")
        if "ACUTE ACCENT" in name:
            return "acute"
        if "GRAVE ACCENT" in name:
            return "grave"
        if "HOOK ABOVE" in name:
            return "hook"
        if "TILDE" in name:
            return "tilde"
        if "DOT BELOW" in name:
            return "dot"
    return "none"

def apply_rime_rule(no_tone: str) -> tuple[str, str]:
    lower = no_tone.lower()
    rules = [
        ("uoi", "ui", "RN_UOI_UI"),
        ("oi", "au", "RN_OI_AU"),
        ("ang", "eng", "RN_ANG_ENG"),
        ("an", "en", "RN_AN_EN"),
    ]
    for src, dst, rid in rules:
        if lower.endswith(src):
            return no_tone[:-len(src)] + dst, rid
    return no_tone, "RN_KEEP_RIME"

def encode_text(text: str, protected_tokens: set[str]) -> str:
    def repl(m: re.Match[str]) -> str:
        tok = m.group(0)
        if tok in protected_tokens:
            return f"{tok}[C6:RN_PROTECTED]"
        tone = detect_tone(tok)
        no_tone = strip_vietnamese_tone(tok)
        surface, rule_id = apply_rime_rule(no_tone)
        color = TONE_CLASS[tone]
        return f"{surface}[{color}:{rule_id}]"
    return re.sub(r"[A-Za-zÀ-ỹĐđ0-9_.-]+", repl, text)

def load_protected(path: Path) -> set[str]:
    if not path.exists():
        return set()
    return {x.strip() for x in path.read_text("utf-8").splitlines() if x.strip() and not x.strip().startswith("#")}

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True, help="Folder to process. One folder per run.")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    target = Path(args.dir)
    if not target.exists() or not target.is_dir():
        raise SystemExit(f"Not a directory: {target}")

    protected = load_protected(Path(__file__).with_name("protected_tokens.seed.na"))
    audit = []

    for p in sorted(target.rglob("*")):
        if not p.is_file():
            continue
        if p.suffix in PROTECTED_SUFFIXES:
            audit.append(f"SKIP_PROTECTED_SUFFIX {p}")
            continue
        if p.suffix not in TEXT_SUFFIXES:
            continue
        original = p.read_text("utf-8", errors="ignore")
        encoded = encode_text(original, protected)
        if encoded != original:
            audit.append(f"WOULD_ENCODE {p}" if args.dry_run else f"ENCODED {p}")
            if not args.dry_run:
                p.write_text(encoded, "utf-8")

    log = target / ".hardware_dialect_translator.audit.log"
    log.write_text("\n".join(audit) + "\n", "utf-8")
    changes = sum(1 for x in audit if x.startswith("ENCODED") or x.startswith("WOULD_ENCODE"))
    print(f"audit={log}")
    print(f"changes={changes}")

if __name__ == "__main__":
    main()
