#!/usr/bin/env python3
"""
dialect_cipher_batch_processor.py

Mục đích: Áp dialect color cipher lên CSV 17.815 dòng "Từ Gốc",
output dictionary cipher đầy đủ theo schema SPEC v0.1.si §4.3.

Tham chiếu:
- SPEC: docs/specs/SPEC_DIALECT_COLOR_CIPHER_v0.1.si (commit d4ed0496)
- Engine prototype: tools/dialect-cipher/engine.prototype.py (commit bb1fc2a8)
- File tham khảo Bối Bối: chuyenngu.py (đã fix theo SPEC)

Schema output mỗi dòng theo SPEC §4.3:
    origin_text | vi_standard | cipher_surface | rime_rule_id |
    tone_class | protected_flag | decode_key | row_hmac

Hành vi:
- Áp engine encode lên cột vi_standard (cột 1 trong CSV input).
- Skip entry rác (toàn ký tự không có nghĩa tiếng Việt) và log audit.
- Áp Protected Token Registry seed: token kỹ thuật giữ nguyên với protected_flag=true.
- POLARITY=NORMAL mặc định cho v0.1.

Tác giả: Băng. Phiên: 2026-04-30.
"""

import re
import csv
import sys
import os
import hmac
import hashlib
from datetime import datetime

# ───────────────────────────────────────────────────────────────────────────
# 1. Engine cipher core — reuse từ engine.prototype.py đã sealed
# ───────────────────────────────────────────────────────────────────────────

TONE_CLASS = {
    'ngang': 'C0', 'sắc': 'C1', 'huyền': 'C2',
    'hỏi':   'C3', 'ngã': 'C4', 'nặng':  'C5',
}

TONE_MARKS = {}
_groups = [
    ('sắc',   'áéíóúýấếốớứắ'),
    ('huyền', 'àèìòùỳầềồờừằ'),
    ('hỏi',   'ảẻỉỏủỷẩểổởửẳ'),
    ('ngã',   'ãẽĩõũỹẫễỗỡữẵ'),
    ('nặng',  'ạẹịọụỵậệộợựặ'),
]
_bases_per_group = 'aeiouyâêôơưă'
for tone_name, marked in _groups:
    for ch_marked, ch_base in zip(marked, _bases_per_group):
        TONE_MARKS[ch_marked] = (ch_base, tone_name)

DIACRITIC_MAP = {
    'â': 'a', 'ê': 'e', 'ô': 'o', 'ơ': 'o', 'ư': 'u', 'ă': 'a',
    'Â': 'A', 'Ê': 'E', 'Ô': 'O', 'Ơ': 'O', 'Ư': 'U', 'Ă': 'A',
}

RN_RULES = [
    ('ươi', 'ui', 'RN_UOI_UI'),
    ('ôi',  'au', 'RN_OI_AU'),
    ('oi',  'au', 'RN_OI_AU'),
    ('ăn',  'en', 'RN_AN_EN'),
]

ONSETS_LONG = ['ngh', 'qu', 'gi', 'ng', 'nh', 'ph', 'kh', 'gh', 'th', 'tr', 'ch']
ONSETS_SHORT = list('bcdđghklmnpqrstvx')


def strip_tone(syllable):
    base = []
    tone = 'ngang'
    for ch in syllable:
        lower = ch.lower()
        if lower in TONE_MARKS:
            ch_base, t = TONE_MARKS[lower]
            if ch.isupper():
                ch_base = ch_base.upper()
            base.append(ch_base)
            tone = t
        else:
            base.append(ch)
    return ''.join(base), tone


def strip_diacritic(text):
    return ''.join(DIACRITIC_MAP.get(c, c) for c in text)


def split_onset_rime(syllable):
    lower = syllable.lower()
    for o in ONSETS_LONG:
        if lower.startswith(o):
            return syllable[:len(o)], syllable[len(o):]
    if lower and lower[0] in ONSETS_SHORT:
        return syllable[:1], syllable[1:]
    return '', syllable


def encode_syllable(syllable):
    """Encode âm tiết → (cipher_surface lowercase, tone_class, rime_rule_id)."""
    base, tone = strip_tone(syllable)
    onset, rime = split_onset_rime(base)
    rime_lower = rime.lower()

    for pat, repl, rule_id in RN_RULES:
        if rime_lower == pat:
            return (onset + repl).lower(), TONE_CLASS[tone], rule_id

    new_onset = strip_diacritic(onset)
    new_rime = strip_diacritic(rime)
    cipher_surface = (new_onset + new_rime).lower()
    rule_id = 'R_KEEP' if tone == 'ngang' else 'R_TONE_ONLY'
    return cipher_surface, TONE_CLASS[tone], rule_id


# ───────────────────────────────────────────────────────────────────────────
# 2. Protected Token Registry seed (SPEC dialect color cipher §6)
# ───────────────────────────────────────────────────────────────────────────

PROTECTED_TOKENS = {
    # Transport
    'HeyNa', 'Nahere', 'Whao', 'Whau', 'lech', 'gay', 'EventBus', 'SmartLink',
    # Component
    'KhaiCell', 'siraSign', 'NATT-CELL', 'NATT-OS', 'NATTOS',
    # File format
    '.anc', '.na', '.phieu', '.si', '.sira', '.bang',
    # Entity
    'Băng', 'Thiên Lớn', 'Kim', 'Can', 'Bối Bội', 'Bối Bối',
    'Anh Khải', 'Nat', 'Natt',
    # Rank
    'Gatekeeper', 'Obikeeper', 'Cán Cân', 'Chị Tư',
    # Identity hash
    'IDENTITY_SHAPE_HASH',
    # Sirawat trailer
    'Sirawat-From', 'Sirawat-To', 'Scope', 'Decision', 'Boundary',
    'Ground-Truth', 'Next-Signal',
    # SPEC names
    'SPEC_NEN', 'SPEC_NAUION_MAIN', 'SPEC_FINANCE_FLOW',
    'SPEC_DIALECT_COLOR_CIPHER', 'SPEC_CHROMATIC_ANCHOR_MESH',
}


def is_protected_token(text):
    """Kiểm tra xem text có chứa Protected Token không."""
    for token in PROTECTED_TOKENS:
        if token in text:
            return True
    return False


# ───────────────────────────────────────────────────────────────────────────
# 3. row_hmac với HKDF domain-separated (SPEC §4.1)
# ───────────────────────────────────────────────────────────────────────────

def derive_cipher_key(master_key: bytes, domain: str) -> bytes:
    """HKDF derive key cho domain dialect-cipher."""
    # Simplified HKDF (extract + expand) for v0.1 prototype
    prk = hmac.new(b'\x00' * 32, master_key, hashlib.sha256).digest()
    info = domain.encode('utf-8')
    okm = hmac.new(prk, info + b'\x01', hashlib.sha256).digest()
    return okm


def compute_row_hmac(decode_key: str, cipher_key: bytes) -> str:
    """Tính row_hmac trên decode_key."""
    return hmac.new(cipher_key, decode_key.encode('utf-8'), hashlib.sha256).hexdigest()


# ───────────────────────────────────────────────────────────────────────────
# 4. Detect rác / edge case
# ───────────────────────────────────────────────────────────────────────────

# Pattern entry rác: chuỗi alphanumeric không có dấu tiếng Việt và không có space
RAC_PATTERN = re.compile(r'^[a-z0-9]{4,}$', re.IGNORECASE)


def is_rac_entry(text):
    """Kiểm tra entry rác (hash ID, random string)."""
    if not text:
        return True
    text = text.strip()
    if not text:
        return True
    # Toàn chữ thường + số, không có dấu tiếng Việt, không có space
    if RAC_PATTERN.match(text):
        # Có chữ Việt (dấu) thì không phải rác
        if any(c in TONE_MARKS or c in DIACRITIC_MAP for c in text.lower()):
            return False
        return True
    return False


# ───────────────────────────────────────────────────────────────────────────
# 5. Encode entry đầy đủ theo schema SPEC §4.3
# ───────────────────────────────────────────────────────────────────────────

def encode_entry(origin_text: str, vi_standard: str, cipher_key: bytes):
    """
    Encode một entry CSV thành dictionary cipher đầy đủ.
    Trả về dict theo schema SPEC §4.3, hoặc None nếu là entry rác.
    """
    if is_rac_entry(vi_standard):
        return None

    if is_protected_token(vi_standard):
        # Protected token: giữ nguyên, không cipher
        decode_key = f"{vi_standard}|R_KEEP|C6"
        return {
            'origin_text':     origin_text,
            'vi_standard':     vi_standard,
            'origin_no_tone':  vi_standard,
            'cipher_surface':  vi_standard,
            'rime_rule_id':    'R_KEEP',
            'tone_class':      'C6',  # escape/protected
            'protected_flag':  'true',
            'decode_key':      decode_key,
            'row_hmac':        compute_row_hmac(decode_key, cipher_key),
        }

    # Encode từng âm tiết, ghép lại
    syllables = re.findall(r"\w+", vi_standard, re.UNICODE)
    if not syllables:
        return None

    cipher_parts = []
    rule_ids = []
    tone_classes = []
    no_tone_parts = []

    for syl in syllables:
        cipher_surface, tone_class, rule_id = encode_syllable(syl)
        no_tone, _ = strip_tone(syl)
        cipher_parts.append(cipher_surface)
        rule_ids.append(rule_id)
        tone_classes.append(tone_class)
        no_tone_parts.append(no_tone)

    cipher_full = ' '.join(cipher_parts)
    no_tone_full = ' '.join(no_tone_parts)
    rule_id_str = ','.join(rule_ids)
    tone_class_str = ','.join(tone_classes)

    decode_key = f"{no_tone_full}|{rule_id_str}|{tone_class_str}"

    return {
        'origin_text':     origin_text,
        'vi_standard':     vi_standard,
        'origin_no_tone':  no_tone_full,
        'cipher_surface':  cipher_full,
        'rime_rule_id':    rule_id_str,
        'tone_class':      tone_class_str,
        'protected_flag':  'false',
        'decode_key':      decode_key,
        'row_hmac':        compute_row_hmac(decode_key, cipher_key),
    }


# ───────────────────────────────────────────────────────────────────────────
# 6. Batch processor
# ───────────────────────────────────────────────────────────────────────────

def process_csv(input_path: str, output_path: str, audit_path: str,
                master_key: bytes = b'natt-os-master-key-v0.1-placeholder'):
    """
    Đọc CSV input, áp cipher từng dòng, ghi CSV output đầy đủ schema SPEC,
    và ghi audit log cho các edge case.
    """
    cipher_key = derive_cipher_key(master_key, 'natt-os/dialect-cipher/v0.1')

    stats = {
        'total':     0,
        'encoded':   0,
        'protected': 0,
        'rac':       0,
        'empty':     0,
    }
    rac_samples = []

    print(f"=== Dialect Cipher Batch Processor v0.1 ===")
    print(f"Input:  {input_path}")
    print(f"Output: {output_path}")
    print(f"Audit:  {audit_path}")
    print(f"POLARITY=NORMAL (mặc định v0.1)")
    print()

    output_rows = []
    output_rows.append([
        'origin_text', 'vi_standard', 'origin_no_tone', 'cipher_surface',
        'rime_rule_id', 'tone_class', 'protected_flag', 'decode_key', 'row_hmac',
    ])

    with open(input_path, 'r', encoding='utf-8-sig') as fin:
        reader = csv.reader(fin)
        for row in reader:
            stats['total'] += 1
            if not row or len(row) < 2:
                stats['empty'] += 1
                continue

            origin_text = row[0].strip() if row[0] else ''
            vi_standard = row[1].strip() if len(row) > 1 else ''

            if not vi_standard:
                stats['empty'] += 1
                continue

            entry = encode_entry(origin_text, vi_standard, cipher_key)

            if entry is None:
                stats['rac'] += 1
                if len(rac_samples) < 50:
                    rac_samples.append((origin_text, vi_standard))
                continue

            if entry['protected_flag'] == 'true':
                stats['protected'] += 1
            else:
                stats['encoded'] += 1

            output_rows.append([
                entry['origin_text'],
                entry['vi_standard'],
                entry['origin_no_tone'],
                entry['cipher_surface'],
                entry['rime_rule_id'],
                entry['tone_class'],
                entry['protected_flag'],
                entry['decode_key'],
                entry['row_hmac'],
            ])

    # Ghi output CSV
    with open(output_path, 'w', encoding='utf-8', newline='') as fout:
        writer = csv.writer(fout)
        writer.writerows(output_rows)

    # Ghi audit log
    with open(audit_path, 'w', encoding='utf-8') as faud:
        faud.write(f"# Dialect Cipher Batch Audit Log\n")
        faud.write(f"# Run: {datetime.now().isoformat()}\n")
        faud.write(f"# SPEC: SPEC_DIALECT_COLOR_CIPHER_v0.1.si (commit d4ed0496)\n")
        faud.write(f"# Engine: tools/dialect-cipher/engine.prototype.py (commit bb1fc2a8)\n")
        faud.write(f"# POLARITY: NORMAL\n")
        faud.write(f"# Domain: natt-os/dialect-cipher/v0.1\n")
        faud.write(f"\n## Stats\n")
        for k, v in stats.items():
            pct = (v / stats['total'] * 100) if stats['total'] else 0
            faud.write(f"  {k:10s}: {v:6d} ({pct:5.2f}%)\n")
        faud.write(f"\n## Rac samples (max 50)\n")
        for origin, vi in rac_samples:
            faud.write(f"  origin={origin!r:40s} vi={vi!r}\n")
        faud.write(f"\n## Protected tokens registry\n")
        for token in sorted(PROTECTED_TOKENS):
            faud.write(f"  {token}\n")

    # Print summary
    print(f"=== SUMMARY ===")
    for k, v in stats.items():
        pct = (v / stats['total'] * 100) if stats['total'] else 0
        print(f"  {k:10s}: {v:6d} ({pct:5.2f}%)")
    print(f"\nOutput rows: {len(output_rows) - 1}")
    print(f"Audit log: {audit_path}")


# ───────────────────────────────────────────────────────────────────────────
# 7. Main
# ───────────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Cách dùng:")
        print(f"  python3 {sys.argv[0]} <input.csv> <output.csv> [audit.log]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]
    audit_path = sys.argv[3] if len(sys.argv) > 3 else output_path.replace('.csv', '.audit.log')

    if not os.path.isfile(input_path):
        print(f"Lỗi: không tìm thấy file input: {input_path}")
        sys.exit(1)

    process_csv(input_path, output_path, audit_path)
