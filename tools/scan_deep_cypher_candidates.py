#!/usr/bin/env python3
import os
import re
from collections import Counter

print("═══════════════════════════════════════════════════════════════════")
print(" [BỐI BỐI] DEEP SCANNER: VÉT ĐÁY TOP 100 TỪ KHÓA TRONG LÕI NATT-OS")
print("═══════════════════════════════════════════════════════════════════")

# 35 từ gốc đã biết, không quét lại
ALREADY_KNOWN = {
    'payload', 'event_id', 'trace_id', 'span_id', 'causation_id', 'timestamp',
    'function', 'return', 'import', 'export', 'interface', 'class', 'object', 'array',
    'true', 'false', 'null', 'undefined', 'async', 'await', 'try', 'catch',
    'success', 'error', 'pending', 'status', 'state', 'emit', 'subscribe',
    'const', 'let', 'var', 'if', 'else', 'switch'
}

word_counts = Counter()
# Chặn các ổ chứa rác để quét nhanh hơn và chuẩn hơn
FORBIDDEN_DIRS = ["node_modules", ".git", "dist", "build", "archive", "_deprecated", "_legacy", "public"]

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in FORBIDDEN_DIRS]
    for f in files:
        if f.endswith(('.ts', '.js', '.na', '.json', '.sh', '.py')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    # Quét toàn bộ các từ (bao gồm cả camelCase, snake_case sẽ bị tách ra để đếm rễ từ)
                    words = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', content)
                    for w in words:
                        # Chuẩn hóa về chữ thường để đếm cho chuẩn
                        w_lower = w.lower()
                        # Bỏ qua từ cũ, từ rác độ dài < 4 ký tự (như id, req, res, i, j)
                        if w_lower not in ALREADY_KNOWN and len(w_lower) >= 4:
                            word_counts[w_lower] += 1
            except Exception:
                pass

print(f"\n[+] TOP 100 'HUYỆT ĐẠO' NGÔN NGỮ ĐANG ẨN TRONG LÕI:\n")
for word, count in word_counts.most_common(100):
    print(f"   - {word.ljust(15)} : {count} lần xuất hiện")

print("\n=> KẾT LUẬN: Anh Natt nhắm xem trong đống này có từ nào là 'Tử huyệt' (Core Business/Architecture) thì bốc ra Cypher hóa!")
print("═══════════════════════════════════════════════════════════════════")
