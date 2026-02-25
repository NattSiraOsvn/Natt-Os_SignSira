#!/usr/bin/env python3
"""
Fix corrupted UTF-8 Vietnamese strings in 2 files.
Reads as binary, replaces corrupted byte sequences with proper UTF-8.
"""
import os, sys

GM = os.path.expanduser(
    "~/Desktop/HỒ SƠ SHTT NATT-OS BY NATTSIRA-OS/natt-os ver2goldmaster"
)

DRY = "--dry" in sys.argv

def fix_file(rel_path):
    full = os.path.join(GM, rel_path)
    if not os.path.isfile(full):
        print(f"  ⏭️  {rel_path} not found")
        return False

    with open(full, "rb") as f:
        raw = f.read()

    # Find all non-UTF8-safe lines by trying to decode
    # Strategy: decode with errors='replace', find replaced chars
    text = raw.decode('utf-8', errors='replace')
    
    if '\ufffd' not in text:
        print(f"  ✅ {rel_path} — no corrupted bytes found")
        return False

    count = text.count('\ufffd')
    print(f"  🔧 {rel_path} — {count} corrupted byte(s) found")

    # Replace known corrupted Vietnamese strings with proper versions
    replacements = [
        # conflict-resolver.ts
        ("Xung \ufffd\ufffdt d\u1eef li\ufffdu c\u1ea7n xem x\u00e9t",
         "Xung dot du lieu can xem xet"),
        ("Xung \ufffd\ufffdt t\u1ea1i",
         "Xung dot tai"),
        # dictionary-approval-service.ts  
        ("Y\u00eau c\u1ea7u thay \ufffd\ufffdi T\u1eeb \ufffdi\ufffdn",
         "Yeu cau thay doi Tu dien"),
        ("mu\ufffdn",
         "muon"),
        ("tr\u01b0\ufffdng",
         "truong"),
        ("\ufffd\ufffd \u1ea3nh h\u01b0\ufffdng",
         "do anh huong"),
        ("M\u1ee9c \ufffd\ufffd",
         "Muc do"),
    ]

    for old, new in replacements:
        if old in text:
            text = text.replace(old, new)
            print(f"    → Replaced: '{new}'")

    # Catch any remaining replacement chars — replace with '?'
    remaining = text.count('\ufffd')
    if remaining > 0:
        print(f"    ⚠️  {remaining} remaining corrupted chars → replacing with '?'")
        text = text.replace('\ufffd', '?')

    if DRY:
        print(f"  [DRY] Would write {rel_path}")
        return True

    with open(full, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"  ✅ {rel_path} — fixed")
    return True


print("=" * 60)
print("FIX CORRUPTED UTF-8 IN VIETNAMESE STRINGS")
print("=" * 60)

if not os.path.isdir(GM):
    print(f"❌ Goldmaster not found: {GM}")
    sys.exit(1)

fixed1 = fix_file("src/services/conflict/conflict-resolver.ts")
fixed2 = fix_file("src/services/dictionary-approval-service.ts")

if fixed1 or fixed2:
    print("\n✅ Done. Verify:")
    print("  npx tsc --noEmit 2>&1 | head -10")
else:
    print("\n⚠️  No fixes applied")
