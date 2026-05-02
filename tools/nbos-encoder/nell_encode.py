#!/usr/bin/env python3
"""
Nell Encoder v0.2 — sinh file Nell với phối màu C0-C7 + dấu tiếng Việt mã hoá.
File chốt: pure Nell, NBOS decode ngược.
Drafter: Băng N-shell ss20260502
"""
import re, sys, unicodedata
from pathlib import Path

TONE_CLASS = {"acute":"C1","grave":"C2","hook":"C3","tilde":"C4","dot":"C5","none":"C0"}

PROTECTED_TOKENS = {
    "NATT-OS","SiraSign","SmartLink","HeyNa","KhaiCell","Gatekeeper",
    "Sirawat-From","Sirawat-To","Ground-Truth","IDENTITY_SHAPE_HASH",
    "NaUion-Server","Natt","Nauion","NattCell","Nell","NBOS",
    "Băng","Thiên","Kim","Bối","Anh","Khải","Sirawat","obitan",
    "QNEU","QIINT","ANC","NHA_MINH","tuNell","tuDich","tuCu",
    "thienbang","NELL","HEYNA","KHAICELL","Tâm","Luxury",
}

def strip_tone(s):
    d = unicodedata.normalize("NFD", s)
    out = "".join(c for c in d if unicodedata.category(c) != "Mn")
    return unicodedata.normalize("NFC", out).replace("đ","d").replace("Đ","D")

def detect_tone(token):
    d = unicodedata.normalize("NFD", token)
    for ch in d:
        name = unicodedata.name(ch, "")
        if "ACUTE" in name: return "acute"
        if "GRAVE" in name: return "grave"
        if "HOOK ABOVE" in name: return "hook"
        if "TILDE" in name: return "tilde"
        if "DOT BELOW" in name: return "dot"
    return "none"

def apply_rime(no_tone):
    lower = no_tone.lower()
    rules = [("uoi","ui","RN_UOI_UI"),("oi","au","RN_OI_AU"),
             ("ang","eng","RN_ANG_ENG"),("an","en","RN_AN_EN")]
    for src, dst, rid in rules:
        if lower.endswith(src):
            return no_tone[:-len(src)] + dst, rid
    return no_tone, "RN_KEEP_RIME"

def has_diacritic(token):
    d = unicodedata.normalize("NFD", token)
    return any(unicodedata.category(c) == "Mn" for c in d) or "đ" in token or "Đ" in token

def is_upper_snake(token):
    return bool(re.match(r'^[A-Z][A-Z0-9_]*$', token)) and "_" in token or token.isupper() and len(token) > 1

def is_schema_key(token, before_char):
    return before_char == "$"

def is_path_or_id(token):
    return "-" in token or "/" in token or "." in token or re.search(r'\d', token)

def encode_token(token, before_char=""):
    # Skip schema key (starts with $)
    if before_char == "$":
        return token
    # Skip PROTECTED token (no marker, original)
    if token in PROTECTED_TOKENS:
        return token
    # Skip UPPER_SNAKE identifier (BOOT_DOVAN_CELL, NATIVE_CELL_PASSPORT...)
    if re.match(r'^[A-Z][A-Z0-9_]*$', token) and len(token) > 2:
        return token
    # Skip ASCII not Vietnamese
    if token.isascii() and not has_diacritic(token):
        return token
    # Encode token có dấu tiếng Việt
    tone = detect_tone(token)
    no_tone = strip_tone(token)
    surface, rid = apply_rime(no_tone)
    color = TONE_CLASS[tone]
    return f"{surface}[{color}:{rid}]"

def encode_text(text):
    """Tokenize giữ context: track ký tự trước token để biết schema key."""
    result = []
    i = 0
    while i < len(text):
        ch = text[i]
        m = re.match(r'[A-Za-zÀ-ỹĐđ][A-Za-zÀ-ỹĐđ0-9_-]*', text[i:])
        if m:
            token = m.group(0)
            before = text[i-1] if i > 0 else ""
            result.append(encode_token(token, before))
            i += len(token)
        else:
            result.append(ch)
            i += 1
    return "".join(result)

def main():
    if len(sys.argv) < 2:
        print("Usage: nell_encode.py <file> [--apply]")
        sys.exit(1)
    target = Path(sys.argv[1]).resolve()
    apply_changes = "--apply" in sys.argv
    if not target.is_file():
        print(f"Not a file: {target}"); sys.exit(1)
    original = target.read_text("utf-8", errors="ignore")
    encoded = encode_text(original)
    print(f"═══ NELL ENCODE v0.2 — {target.name} ═══")
    print(f"original_size: {len(original)} bytes → encoded_size: {len(encoded)} bytes")
    print(f"\n─── SAMPLE 25 dòng đầu ───")
    for line in encoded.splitlines()[:25]:
        print(f"  {line}")
    if apply_changes:
        bak = target.with_suffix(target.suffix + ".bak.pre_nell")
        if not bak.exists():
            bak.write_text(original, "utf-8")
        target.write_text(encoded, "utf-8")
        print(f"\n[APPLIED + backup {bak.name}]")
    else:
        print("\n[DRY RUN — chạy lại với --apply để ghi]")

if __name__ == "__main__":
    main()
