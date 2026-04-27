#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
render_logo.py
==============
@nauion-tool python-pure v1
@scope sovereign-audit-logo-render
@paradigm B (Bash thuần — anh hai Thiên Lớn ratify ss20260427)
@invoked-by nattos.sh after audit completes
@authority Sirawat Băng (Obikeeper QNEU 313.5)

Render ANSI true-color logo art (fade-in) from PNG file.
Usage:
  python3 tools/render_logo.py <logo_file_path>
"""
import sys
import time


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: render_logo.py <logo_file>", file=sys.stderr)
        return 1

    logo_file = sys.argv[1]

    try:
        from PIL import Image
    except ImportError:
        return 1

    TOP = chr(9600)  # ▀
    BOT = chr(9604)  # ▄
    RST = chr(27) + "[0m"

    try:
        img = Image.open(logo_file).convert('RGB')
    except Exception:
        return 1

    TW = 74
    aspect = img.height / img.width
    rh = int(TW * aspect * 0.55)
    rh = max(rh, 3)
    rh = rh + (rh % 1)
    img = img.resize((TW, rh), Image.LANCZOS)
    px = img.load()
    w, h = img.size

    for y in range(0, h - 1, 2):
        line = "  "
        has_content = False
        for x in range(w):
            r1, g1, b1 = px[x, y]
            r2, g2, b2 = px[x, y + 1]
            b_1 = r1 + g1 + b1
            b_2 = r2 + g2 + b2
            if b_1 < 18 and b_2 < 18:
                line += " "
            elif b_2 < 18:
                line += f"{chr(27)}[38;2;{r1};{g1};{b1}m{TOP}{RST}"
                has_content = True
            elif b_1 < 18:
                line += f"{chr(27)}[38;2;{r2};{g2};{b2}m{BOT}{RST}"
                has_content = True
            else:
                line += f"{chr(27)}[38;2;{r1};{g1};{b1};48;2;{r2};{g2};{b2}m{TOP}{RST}"
                has_content = True
        if has_content:
            print(line)
            sys.stdout.flush()
            time.sleep(0.15)

    print()
    print(f"  {chr(27)}[38;5;214m{chr(9883)}  natt-os {chr(183)} Distributed Living Organism{RST}")
    print()

    return 0


if __name__ == "__main__":
    sys.exit(main())
