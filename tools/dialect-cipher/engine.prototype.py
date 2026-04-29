"""
Dialect Color Cipher v0.1 — Engine prototype (Python)
SPEC: docs/specs/SPEC_DIALECT_COLOR_CIPHER_v0.1.bang
Mục đích: verify logic encode pass hai test vector §8 byte-by-byte trước khi port sang TS.
Tác giả: Băng. Phiên: 2026-04-30.
"""

import re

# Bảng tone class — §2 SPEC
TONE_CLASS = {
    'ngang': 'C0', 'sắc': 'C1', 'huyền': 'C2',
    'hỏi':   'C3', 'ngã': 'C4', 'nặng':  'C5',
}

# Map ký tự có thanh điệu → (ký tự gốc giữ mũ/móc, tên thanh)
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

# Strip dấu mũ/móc (â→a, ê→e, ô→o, ơ→o, ư→u, ă→a)
DIACRITIC_MAP = {
    'â': 'a', 'ê': 'e', 'ô': 'o', 'ơ': 'o', 'ư': 'u', 'ă': 'a',
    'Â': 'A', 'Ê': 'E', 'Ô': 'O', 'Ơ': 'O', 'Ư': 'U', 'Ă': 'A',
}

# Bộ rule RN_* — §3.2 SPEC. Mỗi rule áp lên rime SAU khi strip thanh điệu,
# TRƯỚC khi strip diacritic implicit. Pattern và replacement đều lower.
RN_RULES = [
    ('ươi', 'ui', 'RN_UOI_UI'),
    ('ôi',  'au', 'RN_OI_AU'),
    ('oi',  'au', 'RN_OI_AU'),  # mở rộng: rule áp cả "oi" không mũ (vd "nói" → "nau")
    ('ăn',  'en', 'RN_AN_EN'),
]

# Phụ âm đầu tiếng Việt — heuristic split onset/rime
ONSETS_LONG = ['ngh', 'qu', 'gi', 'ng', 'nh', 'ph', 'kh', 'gh', 'th', 'tr', 'ch']
ONSETS_SHORT = list('bcdđghklmnpqrstvx')


def strip_tone(syllable):
    """Trả về (base_giữ_mũ_móc, tone_name)."""
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
    """Tách phụ âm đầu và vần."""
    lower = syllable.lower()
    for o in ONSETS_LONG:
        if lower.startswith(o):
            return syllable[:len(o)], syllable[len(o):]
    if lower and lower[0] in ONSETS_SHORT:
        return syllable[:1], syllable[1:]
    return '', syllable


def encode_syllable(syllable):
    """Encode âm tiết → (cipher_surface, tone_class, rime_rule_id)."""
    base, tone = strip_tone(syllable)
    onset, rime = split_onset_rime(base)
    rime_lower = rime.lower()

    # Thử áp rule RN_*
    for pat, repl, rule_id in RN_RULES:
        if rime_lower == pat:
            cipher_surface = (onset + repl).lower()  # quy ước §0: cipher_surface luôn lowercase
            return cipher_surface, TONE_CLASS[tone], rule_id

    # Không có rule. Strip diacritic implicit.
    new_onset = strip_diacritic(onset)
    new_rime = strip_diacritic(rime)
    cipher_surface = (new_onset + new_rime).lower()  # quy ước §0: cipher_surface luôn lowercase

    # Theo test vector §8: R_KEEP khi tone ngang (bất kể diacritic strip);
    # R_TONE_ONLY khi tone khác ngang.
    rule_id = 'R_KEEP' if tone == 'ngang' else 'R_TONE_ONLY'
    return cipher_surface, TONE_CLASS[tone], rule_id


def encode_sentence(sentence):
    words = re.findall(r"\w+", sentence, re.UNICODE)
    return [encode_syllable(w) for w in words]


def format_compact(tokens, polarity='NORMAL'):
    body = ' '.join(f"{s}[{c}:{r}]" for s, c, r in tokens)
    return f"POLARITY={polarity} {body}"


# ───────────────────────────────────────────────────────────────────────────
# Test runner — hai test vector §8 SPEC v0.1
# ───────────────────────────────────────────────────────────────────────────

def run_test(name, sentence, expected):
    actual = format_compact(encode_sentence(sentence))
    ok = actual == expected
    print(f"=== {name} ===")
    print(f"Input:    {sentence}")
    print(f"Expected: {expected}")
    print(f"Actual:   {actual}")
    print(f"Result:   {'PASS' if ok else 'FAIL'}")
    if not ok:
        # Diff chi tiết để debug
        for i, (e, a) in enumerate(zip(expected, actual)):
            if e != a:
                print(f"  First diff at byte {i}: expected {e!r}, got {a!r}")
                break
    print()
    return ok


if __name__ == '__main__':
    expected_1 = "POLARITY=NORMAL ngui[C2:RN_UOI_UI] ta[C0:R_KEEP] nau[C1:RN_OI_AU] chuyen[C5:R_TONE_ONLY] lau[C0:R_KEEP] rau[C2:RN_OI_AU]"
    pass_1 = run_test("Test Vector 1", "Người ta nói chuyện lâu rồi", expected_1)

    expected_2 = "POLARITY=NORMAL o[C3:R_TONE_ONLY] que[C0:R_KEEP] em[C0:R_KEEP] thich[C1:R_TONE_ONLY] en[C0:RN_AN_EN] xau[C0:RN_OI_AU] lam[C1:R_TONE_ONLY]"
    pass_2 = run_test("Test Vector 2", "Ở quê em thích ăn xôi lắm", expected_2)

    print("=== SUMMARY ===")
    print(f"Test Vector 1: {'PASS' if pass_1 else 'FAIL'}")
    print(f"Test Vector 2: {'PASS' if pass_2 else 'FAIL'}")
    print(f"Overall: {'ALL PASS' if (pass_1 and pass_2) else 'FAIL'}")
