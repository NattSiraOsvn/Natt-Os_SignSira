#!/usr/bin/env python3
"""
Fix lines containing C1 control characters (U+0080-U+009F) that TSC rejects.
These are valid UTF-8 but invalid in TypeScript source code.
"""
import os

GM = os.path.expanduser(
    "~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster"
)

def has_c1_controls(s):
    return any(0x80 <= ord(c) <= 0x9F for c in s)

def fix_file(rel_path):
    full = os.path.join(GM, rel_path)
    if not os.path.isfile(full):
        print(f"  ⏭️  {rel_path} not found")
        return False

    with open(full, "r", encoding="utf-8") as f:
        lines = f.readlines()

    fixed = 0
    for i, line in enumerate(lines):
        if has_c1_controls(line):
            # Strip all C1 control chars and nearby '?' artifacts
            cleaned = ""
            skip_next_q = False
            for j, ch in enumerate(line):
                if 0x80 <= ord(ch) <= 0x9F:
                    # Skip C1 control char
                    # Also check if previous char was '?' (artifact)
                    if cleaned and cleaned[-1] == '?':
                        cleaned = cleaned[:-1]
                    continue
                cleaned += ch
            lines[i] = cleaned
            fixed += 1
            print(f"  🔧 Line {i+1}: removed C1 controls")
            print(f"     Before: {repr(line.rstrip())}")
            print(f"     After:  {repr(cleaned.rstrip())}")

    if fixed == 0:
        print(f"  ✅ {rel_path} — no C1 control characters found")

        # Fallback: dump hex of error lines for diagnosis
        for target_line in [79, 56] if 'conflict' in rel_path else [56]:
            if target_line <= len(lines):
                ln = lines[target_line - 1]
                print(f"\n  📋 Line {target_line} hex dump:")
                raw = ln.encode('utf-8')
                for k in range(0, min(len(raw), 120), 16):
                    chunk = raw[k:k+16]
                    hexpart = ' '.join(f'{b:02x}' for b in chunk)
                    ascpart = ''.join(chr(b) if 32 <= b < 127 else '.' for b in chunk)
                    print(f"     {k:04x}: {hexpart:<48s} {ascpart}")
        return False

    with open(full, "w", encoding="utf-8") as f:
        f.writelines(lines)
    print(f"  ✅ {rel_path} — {fixed} line(s) fixed")
    return True

print("=" * 60)
print("FIX C1 CONTROL CHARACTERS IN TSC-FAILING FILES")
print("=" * 60)

fix_file("src/services/conflict/conflict-resolver.ts")
print()
fix_file("src/services/dictionary-approval-service.ts")

print("\nVerify: npx tsc --noEmit 2>&1 | head -10")
