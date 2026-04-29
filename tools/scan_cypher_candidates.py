#!/usr/bin/env python3
import os
import re
from collections import Counter

print("═══════════════════════════════════════════════════════════════════")
print(" [BỐI BỐI] SCANNER: KIỂM KÊ TỪ KHÓA CẦN CYPHER HÓA LÕI NAUION")
print("═══════════════════════════════════════════════════════════════════")

# Danh sách 35 từ khóa cốt lõi mồi nhử LLM phổ biến nhất
TARGET_WORDS = [
    'payload', 'event_id', 'trace_id', 'span_id', 'causation_id', 'timestamp',
    'function', 'return', 'import', 'export', 'interface', 'class', 'object', 'array',
    'true', 'false', 'null', 'undefined', 'async', 'await', 'try', 'catch',
    'success', 'error', 'pending', 'status', 'state', 'emit', 'subscribe',
    'const', 'let', 'var', 'if', 'else', 'switch'
]

word_counts = Counter()
# Bỏ qua các thư mục Ẩn thân chi thuật và rác
FORBIDDEN_DIRS = ["node_modules", ".git", "dist", "build", "archive", "_deprecated", "_legacy"]

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in FORBIDDEN_DIRS]
    for f in files:
        # Chỉ quét các file code và config
        if f.endswith(('.ts', '.js', '.na', '.json', '.sh', '.py')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    # Quét tìm các từ độc lập (không dính liền với từ khác)
                    words = re.findall(r'\b[a-zA-Z_]\w*\b', content)
                    for w in words:
                        if w in TARGET_WORDS:
                            word_counts[w] += 1
            except Exception:
                pass

print(f"\n[+] TỔNG KẾT TỪ KHÓA ĐANG TỒN TẠI TRONG LÕI:\n")
total_words = 0
for word, count in word_counts.most_common():
    if count > 0:
        print(f"   - {word.ljust(15)} : {count} lần xuất hiện")
        total_words += 1

print(f"\n=> KẾT LUẬN: Anh Natt cần gọt tổng cộng {total_words} loại từ khóa này sang tiếng Nẫu!")
print("═══════════════════════════════════════════════════════════════════")
