#!/usr/bin/env python3
"""
sanitize-evidence-html.py

Mục đích: Xóa link bên thứ 3 (external) khỏi file HTML chứng cứ lập pháp,
chuẩn bị tài liệu cho lập pháp Hiến Pháp / SPEC nhà mình.

Quy ước phân loại link:
- INTERNAL (giữ nguyên):
    * relative path (không có scheme://)
    * fragment-only (#section)
    * file:// URLs
    * domain chứa "natt-os", "tam-luxury", "tamluxury", "nattos"
- EXTERNAL (xóa thẻ, giữ text bên trong):
    * mọi href có scheme http/https tới domain ngoài whitelist

Hành vi:
- External <a href="...">text</a> → text (unwrap, giữ context đọc được)
- Internal <a> → giữ nguyên
- KHÔNG overwrite file gốc — ship sang *.sanitized.html
- Audit log: liệt kê từng URL đã xóa, kèm text bên trong và vị trí xấp xỉ

Cách dùng:
    python3 sanitize-evidence-html.py <input.html>

Output:
    <input>.sanitized.html      — bản đã clean
    <input>.sanitize-audit.log  — audit trail

Tác giả: Băng. Phiên: 2026-04-30.
"""

import re
import sys
import os
from urllib.parse import urlparse
from datetime import datetime

# Whitelist domain — link chứa các substring này được coi là internal
INTERNAL_DOMAIN_PATTERNS = [
    'natt-os',
    'nattos',
    'tam-luxury',
    'tamluxury',
]


def classify_href(href):
    """Trả về 'internal' hoặc 'external'."""
    if not href:
        return 'internal'  # empty href, giữ
    href = href.strip()
    # Fragment-only
    if href.startswith('#'):
        return 'internal'
    # file:// URLs
    if href.startswith('file://'):
        return 'internal'
    # mailto: — coi là internal vì không phải web link bên thứ 3
    if href.startswith('mailto:'):
        return 'internal'
    # Parse scheme
    parsed = urlparse(href)
    if not parsed.scheme:
        # Relative path
        return 'internal'
    if parsed.scheme not in ('http', 'https'):
        # Khác http/https (data:, javascript:, ...) — giữ thận trọng, coi internal
        return 'internal'
    # http/https — check domain
    netloc = parsed.netloc.lower()
    for pattern in INTERNAL_DOMAIN_PATTERNS:
        if pattern in netloc:
            return 'internal'
    return 'external'


def sanitize_html(html_content):
    """
    Quét tất cả thẻ <a href="...">...</a>, unwrap external links.
    Trả về (sanitized_html, removed_links).
    """
    removed = []

    # Pattern khớp <a ... href="..." ...>...</a>
    # DOTALL để match qua newline. Non-greedy cho nội dung.
    pattern = re.compile(
        r'<a\b([^>]*?)href\s*=\s*"([^"]*)"([^>]*?)>(.*?)</a>',
        re.DOTALL | re.IGNORECASE
    )

    def replace(match):
        attrs_before = match.group(1)
        href = match.group(2)
        attrs_after = match.group(3)
        inner = match.group(4)

        kind = classify_href(href)
        if kind == 'external':
            removed.append({
                'href': href,
                'inner_text': inner.strip()[:200],
                'position': match.start(),
            })
            # Unwrap: trả về text bên trong
            return inner
        else:
            # Internal — giữ nguyên thẻ
            return match.group(0)

    sanitized = pattern.sub(replace, html_content)

    # Pattern thứ hai: <a href='...'> với single quote (phòng hờ)
    pattern_single = re.compile(
        r"<a\b([^>]*?)href\s*=\s*'([^']*)'([^>]*?)>(.*?)</a>",
        re.DOTALL | re.IGNORECASE
    )

    def replace_single(match):
        href = match.group(2)
        inner = match.group(4)
        kind = classify_href(href)
        if kind == 'external':
            removed.append({
                'href': href,
                'inner_text': inner.strip()[:200],
                'position': match.start(),
            })
            return inner
        return match.group(0)

    sanitized = pattern_single.sub(replace_single, sanitized)
    return sanitized, removed


def write_audit_log(removed, input_path, log_path):
    """Ghi audit log."""
    with open(log_path, 'w', encoding='utf-8') as f:
        f.write(f"# Sanitize Evidence HTML — Audit Log\n")
        f.write(f"# Input: {input_path}\n")
        f.write(f"# Run at: {datetime.now().isoformat()}\n")
        f.write(f"# Total external links removed: {len(removed)}\n")
        f.write(f"# Whitelist patterns: {', '.join(INTERNAL_DOMAIN_PATTERNS)}\n")
        f.write("#\n")
        f.write("# Format mỗi entry:\n")
        f.write("#   [index] position=<byte_offset>\n")
        f.write("#     href: <url>\n")
        f.write("#     text: <inner_text_truncated_200_chars>\n")
        f.write("#\n\n")
        for i, r in enumerate(removed, 1):
            f.write(f"[{i:04d}] position={r['position']}\n")
            f.write(f"    href: {r['href']}\n")
            f.write(f"    text: {r['inner_text']!r}\n")
            f.write("\n")


def main():
    if len(sys.argv) != 2:
        print(__doc__, file=sys.stderr)
        sys.exit(2)

    input_path = sys.argv[1]
    if not os.path.isfile(input_path):
        print(f"Error: file not found: {input_path}", file=sys.stderr)
        sys.exit(1)

    base, ext = os.path.splitext(input_path)
    output_path = f"{base}.sanitized.html"
    log_path = f"{base}.sanitize-audit.log"

    with open(input_path, 'r', encoding='utf-8') as f:
        html = f.read()

    sanitized, removed = sanitize_html(html)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(sanitized)

    write_audit_log(removed, input_path, log_path)

    print(f"=== Sanitize Evidence HTML — Done ===")
    print(f"Input:        {input_path}")
    print(f"Output:       {output_path}")
    print(f"Audit log:    {log_path}")
    print(f"Removed:      {len(removed)} external link(s)")
    print(f"Original:     UNCHANGED (memory folder discipline)")


if __name__ == '__main__':
    main()
