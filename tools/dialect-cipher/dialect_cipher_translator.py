#!/usr/bin/env python3
"""
dialect_cipher_translator.py

Mục đích: Áp dialect cipher lên source code của một cell, chuyển ngữ string tiếng Việt
sang dạng cipher mà không động vào code identifier hay Protected Token.

Tham chiếu:
- SPEC: docs/specs/SPEC_DIALECT_COLOR_CIPHER_v0.1.si (commit d4ed0496)
- Engine: tools/dialect-cipher/engine.prototype.py (commit bb1fc2a8)
- Dictionary: tools/dialect-cipher/dialect_cipher_dictionary.csv (commit ef2a799d)

Quy tắc:
- Chạy mỗi lần một thư mục (cell) theo chỉ đạo Gatekeeper.
- Mặc định dry-run: output sang thư mục mirror với suffix _ciphered, KHÔNG overwrite gốc.
- Flag --apply: overwrite file gốc (chỉ dùng sau khi review dry-run xong).
- Bảo vệ Protected Token Registry: KhaiCell, HeyNa, Băng, .anc, .si, v.v. giữ nguyên.
- Chỉ cipher string literal tiếng Việt, không cipher code identifier hay tiếng Anh.

Cách dùng:
    # Dry-run trên cell pilot
    python3 dialect_cipher_translator.py src/cells/finance-cell/

    # Sau khi review dry-run, áp thật
    python3 dialect_cipher_translator.py src/cells/finance-cell/ --apply

Tác giả: Băng. Phiên: 2026-04-30.
"""

import os
import re
import csv
import sys
import shutil
import argparse
from datetime import datetime
from pathlib import Path

# ───────────────────────────────────────────────────────────────────────────
# 1. Config
# ───────────────────────────────────────────────────────────────────────────

# Extension được xử lý
TARGET_EXTENSIONS = {
    '.ts', '.tsx', '.js', '.jsx', '.mjs',
    '.md', '.json',
    '.html', '.vue',
    '.py', '.yaml', '.yml',
    '.bang', '.na', '.si', '.phieu', '.anc',
}

# Folder bỏ qua
SKIP_FOLDERS = {
    'node_modules', '.git', 'dist', 'build', '.next', '.cache',
    '__pycache__', '.venv', 'venv', '_deprecated',
}

# Dictionary path mặc định
DEFAULT_DICTIONARY = 'tools/dialect-cipher/dialect_cipher_dictionary.csv'

# Pattern detect string literal trong code
# Bắt strings trong "...", '...', `...` kể cả multiline cho backtick
STRING_PATTERNS = [
    (re.compile(r'"((?:[^"\\]|\\.)*)"', re.DOTALL),  '"'),
    (re.compile(r"'((?:[^'\\]|\\.)*)'", re.DOTALL),  "'"),
    (re.compile(r'`((?:[^`\\]|\\.)*)`', re.DOTALL),  '`'),
]

# Pattern detect text tiếng Việt (có ít nhất một ký tự có dấu)
VI_DIACRITICS = re.compile(r'[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ'
                            r'ÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]')


# ───────────────────────────────────────────────────────────────────────────
# 2. Load dictionary cipher từ commit ef2a799d
# ───────────────────────────────────────────────────────────────────────────

def load_dictionary(dict_path):
    """
    Đọc dictionary cipher CSV, build hai bảng:
    - vi_to_cipher: mapping vi_standard → cipher_surface để cipher
    - protected_set: tập Protected Token để giữ nguyên
    """
    vi_to_cipher = {}
    protected_set = set()

    if not os.path.isfile(dict_path):
        print(f"Cảnh báo: không tìm thấy dictionary tại {dict_path}")
        print(f"Tool sẽ chạy với engine cipher inline, không có lookup tăng cường.")
        return {}, set()

    with open(dict_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            vi_std = row.get('vi_standard', '').strip()
            cipher = row.get('cipher_surface', '').strip()
            protected = row.get('protected_flag', 'false').strip().lower() == 'true'
            if not vi_std:
                continue
            if protected:
                protected_set.add(vi_std)
            else:
                if vi_std and cipher:
                    vi_to_cipher[vi_std] = cipher

    print(f"Đã load dictionary: {len(vi_to_cipher)} cipher entries, {len(protected_set)} protected tokens")
    return vi_to_cipher, protected_set


# ───────────────────────────────────────────────────────────────────────────
# 3. Engine cipher inline (reuse từ batch processor)
# ───────────────────────────────────────────────────────────────────────────

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
    'đ': 'd', 'Đ': 'D',
}

RN_RULES = [
    ('ươi', 'ui'), ('ôi', 'au'), ('oi', 'au'), ('ăn', 'en'),
]

ONSETS_LONG = ['ngh', 'qu', 'gi', 'ng', 'nh', 'ph', 'kh', 'gh', 'th', 'tr', 'ch']
ONSETS_SHORT = list('bcdđghklmnpqrstvx')


def strip_tone(syllable):
    base = []
    for ch in syllable:
        lower = ch.lower()
        if lower in TONE_MARKS:
            ch_base, _ = TONE_MARKS[lower]
            if ch.isupper():
                ch_base = ch_base.upper()
            base.append(ch_base)
        else:
            base.append(ch)
    return ''.join(base)


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


def encode_syllable_inline(syllable):
    """Encode âm tiết về cipher_surface lowercase."""
    base = strip_tone(syllable)
    onset, rime = split_onset_rime(base)
    rime_lower = rime.lower()
    for pat, repl in RN_RULES:
        if rime_lower == pat:
            return (onset + repl).lower()
    return strip_diacritic(onset + rime).lower()


# ───────────────────────────────────────────────────────────────────────────
# 4. Cipher một string literal
# ───────────────────────────────────────────────────────────────────────────

def is_protected(text, protected_set):
    """Kiểm tra string có chứa Protected Token không."""
    for token in protected_set:
        if token in text:
            return True
    return False


# Protected compound phrases — các cụm từ móc lưới đã đứng trong logic vận hành.
# Khi một cụm xuất hiện trong text, toàn cụm được giữ nguyên không cipher.
# Phân biệt với protected_set thông thường: compound áp ở mức cụm từ trước khi cipher,
# protected_set áp ở mức nhận diện toàn string nếu chứa token.
PROTECTED_COMPOUNDS = [
    'Mạch HeyNa', 'Mạch SmartLink', 'Mạch EventBus',
    'Mạch Nahere', 'Mạch Whao', 'Mạch Whau',
    'Tâm Luxury', 'Tâm luxury',
    'Hiến Pháp', 'Hiến pháp',
    'Anh Khải', 'anh Khải',
    'Anh Natt', 'anh Natt',
    'Thiên Lớn', 'thiên Lớn',
    'Bối Bối', 'Bối Bội',
    'Chị Tư', 'Chị Ba',
    'Cán Cân',
]


def protect_compounds(text):
    """
    Thay thế tạm các cụm móc lưới bằng placeholder để cipher engine không động vào.
    Trả về (protected_text, mapping placeholder→original).
    """
    mapping = {}
    protected = text
    for i, compound in enumerate(PROTECTED_COMPOUNDS):
        if compound in protected:
            placeholder = f'\uE000COMPOUND{i:03d}\uE001'
            protected = protected.replace(compound, placeholder)
            mapping[placeholder] = compound
    return protected, mapping


def restore_compounds(text, mapping):
    """Khôi phục các cụm móc lưới về đúng dạng gốc."""
    for placeholder, original in mapping.items():
        text = text.replace(placeholder, original)
    return text


def cipher_string(text, vi_to_cipher, protected_set, audit_list):
    """
    Áp cipher lên một string. Trả về (text_ciphered, changed: bool).
    Bảo vệ Protected Token bằng cách skip toàn string nếu chứa.
    Bảo vệ Protected Compounds (cụm móc lưới) bằng placeholder swap.
    """
    if not text:
        return text, False

    # Không có dấu tiếng Việt → không cipher
    if not VI_DIACRITICS.search(text):
        return text, False

    # Chứa Protected Token đơn → giữ nguyên toàn string
    if is_protected(text, protected_set):
        audit_list.append({'type': 'protected_skip', 'original': text[:80]})
        return text, False

    # Bước 1: Bảo vệ các cụm móc lưới bằng placeholder
    protected_text, compound_map = protect_compounds(text)

    # Lookup full string trong dictionary trước (sau khi protect compounds)
    if protected_text.strip() in vi_to_cipher:
        ciphered = vi_to_cipher[protected_text.strip()]
        ciphered = restore_compounds(ciphered, compound_map)
        audit_list.append({'type': 'dict_hit', 'original': text[:80], 'ciphered': ciphered[:80]})
        return ciphered, True

    # Fallback: cipher từng âm tiết bằng engine inline (placeholder không bị động vì có ký tự U+E000-U+E001)
    def cipher_word(match):
        word = match.group(0)
        # Skip placeholder
        if '\uE000' in word or '\uE001' in word:
            return word
        if not VI_DIACRITICS.search(word):
            return word
        return encode_syllable_inline(word)

    ciphered = re.sub(r'\b\w+\b', cipher_word, protected_text, flags=re.UNICODE)

    # Bước 2: Khôi phục cụm móc lưới về dạng gốc
    ciphered = restore_compounds(ciphered, compound_map)

    if ciphered != text:
        audit_list.append({'type': 'inline_cipher', 'original': text[:80], 'ciphered': ciphered[:80]})
        return ciphered, True

    return text, False


# ───────────────────────────────────────────────────────────────────────────
# 5. Xử lý một file
# ───────────────────────────────────────────────────────────────────────────

def process_file(file_path, vi_to_cipher, protected_set, audit_list):
    """
    Đọc file, áp cipher lên các string literal.
    Trả về (content_new, num_changes).
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except (UnicodeDecodeError, PermissionError) as e:
        return None, 0

    num_changes = 0
    new_content = content

    for pattern, quote in STRING_PATTERNS:
        def replace_string(match):
            nonlocal num_changes
            inner = match.group(1)
            ciphered, changed = cipher_string(inner, vi_to_cipher, protected_set, audit_list)
            if changed:
                num_changes += 1
                return f'{quote}{ciphered}{quote}'
            return match.group(0)

        new_content = pattern.sub(replace_string, new_content)

    # Xử lý markdown text bare (không trong quote) — chỉ với .md
    if file_path.suffix.lower() == '.md':
        # Cipher mỗi dòng có dấu tiếng Việt nhưng không phải code block
        lines = new_content.split('\n')
        in_code_block = False
        new_lines = []
        for line in lines:
            if line.strip().startswith('```'):
                in_code_block = not in_code_block
                new_lines.append(line)
                continue
            if in_code_block:
                new_lines.append(line)
                continue
            if VI_DIACRITICS.search(line) and not is_protected(line, protected_set):
                ciphered, changed = cipher_string(line, vi_to_cipher, protected_set, audit_list)
                if changed:
                    num_changes += 1
                    new_lines.append(ciphered)
                    continue
            new_lines.append(line)
        new_content = '\n'.join(new_lines)

    return new_content, num_changes


# ───────────────────────────────────────────────────────────────────────────
# 6. Walk thư mục cell
# ───────────────────────────────────────────────────────────────────────────

def walk_cell(cell_dir, vi_to_cipher, protected_set, output_dir, apply_mode):
    """
    Đi qua mọi file trong cell, áp cipher, ghi sang output_dir.
    Nếu apply_mode=True, overwrite file gốc.
    Trả về stats và audit.
    """
    cell_path = Path(cell_dir).resolve()
    if not cell_path.is_dir():
        print(f"Lỗi: {cell_dir} không phải thư mục")
        return None, None

    output_path = Path(output_dir).resolve() if output_dir else None

    stats = {
        'files_scanned': 0,
        'files_changed': 0,
        'files_skipped': 0,
        'total_changes': 0,
    }
    audit_list = []

    for root, dirs, files in os.walk(cell_path):
        # Skip folders
        dirs[:] = [d for d in dirs if d not in SKIP_FOLDERS]

        for fname in files:
            fpath = Path(root) / fname
            if fpath.suffix.lower() not in TARGET_EXTENSIONS:
                stats['files_skipped'] += 1
                continue

            stats['files_scanned'] += 1
            file_audit = []
            new_content, num_changes = process_file(fpath, vi_to_cipher, protected_set, file_audit)

            if new_content is None or num_changes == 0:
                continue

            stats['files_changed'] += 1
            stats['total_changes'] += num_changes

            for entry in file_audit:
                entry['file'] = str(fpath.relative_to(cell_path.parent))
                audit_list.append(entry)

            if apply_mode:
                # Overwrite file gốc
                with open(fpath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
            else:
                # Output sang mirror folder
                if output_path:
                    rel = fpath.relative_to(cell_path)
                    out_file = output_path / rel
                    out_file.parent.mkdir(parents=True, exist_ok=True)
                    with open(out_file, 'w', encoding='utf-8') as f:
                        f.write(new_content)

    return stats, audit_list


# ───────────────────────────────────────────────────────────────────────────
# 7. Main
# ───────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Dialect Cipher Translator — chuyển ngữ codebase theo cell')
    parser.add_argument('cell_dir', help='Thư mục cell để áp cipher')
    parser.add_argument('--apply', action='store_true',
                        help='Overwrite file gốc (mặc định dry-run sang folder _ciphered)')
    parser.add_argument('--dictionary', default=DEFAULT_DICTIONARY,
                        help=f'Đường dẫn dictionary cipher (mặc định {DEFAULT_DICTIONARY})')
    parser.add_argument('--output', default=None,
                        help='Folder output cho dry-run (mặc định <cell_dir>_ciphered)')
    args = parser.parse_args()

    cell_path = Path(args.cell_dir).resolve()
    output_path = Path(args.output).resolve() if args.output else cell_path.parent / f"{cell_path.name}_ciphered"
    audit_path = output_path.parent / f"{cell_path.name}_cipher.audit.log" if not args.apply else cell_path.parent / f"{cell_path.name}_cipher.audit.log"

    print(f"=== Dialect Cipher Translator v0.1 ===")
    print(f"Cell:       {cell_path}")
    print(f"Mode:       {'APPLY (overwrite)' if args.apply else 'DRY-RUN'}")
    if not args.apply:
        print(f"Output:     {output_path}")
    print(f"Audit:      {audit_path}")
    print()

    vi_to_cipher, protected_set = load_dictionary(args.dictionary)
    print()

    stats, audit_list = walk_cell(
        str(cell_path), vi_to_cipher, protected_set,
        str(output_path) if not args.apply else None,
        args.apply
    )

    if stats is None:
        sys.exit(1)

    # Ghi audit log
    audit_path.parent.mkdir(parents=True, exist_ok=True)
    with open(audit_path, 'w', encoding='utf-8') as f:
        f.write(f"# Dialect Cipher Translator — Audit Log\n")
        f.write(f"# Run: {datetime.now().isoformat()}\n")
        f.write(f"# Cell: {cell_path}\n")
        f.write(f"# Mode: {'APPLY' if args.apply else 'DRY-RUN'}\n")
        f.write(f"# Dictionary: {args.dictionary}\n")
        f.write(f"\n## Stats\n")
        for k, v in stats.items():
            f.write(f"  {k:20s}: {v}\n")
        f.write(f"\n## Changes (max 200 entries)\n")
        for i, entry in enumerate(audit_list[:200]):
            f.write(f"\n[{i+1:04d}] type={entry['type']} file={entry.get('file', '?')}\n")
            f.write(f"      original:  {entry.get('original', '')!r}\n")
            if 'ciphered' in entry:
                f.write(f"      ciphered:  {entry.get('ciphered', '')!r}\n")
        if len(audit_list) > 200:
            f.write(f"\n... còn {len(audit_list) - 200} entries nữa, không log hết để tiết kiệm dung lượng.\n")

    print(f"=== SUMMARY ===")
    for k, v in stats.items():
        print(f"  {k:20s}: {v}")
    print(f"\nAudit log:  {audit_path}")
    if not args.apply:
        print(f"\nĐây là DRY-RUN, file gốc KHÔNG bị thay đổi.")
        print(f"File ciphered nằm tại: {output_path}")
        print(f"Sau khi review, chạy lại với --apply để áp thật:")
        print(f"  python3 {sys.argv[0]} {args.cell_dir} --apply")


if __name__ == '__main__':
    main()
# DEPRECATED — ss20260502 — đã dùng 1 lần để chuyển ngữ toàn src/, không dùng lại
# DEPRECATED — ss20260502 — đã dùng 1 lần, không dùng lại
# STATUS: SEALED
