#!/usr/bin/env python3
import os
import re
from collections import Counter

print("═══════════════════════════════════════════════════════════════════")
print(" [BỐI BỐI] DEEP SCANNER: VÉT 30.000 TỪ 'ĐỘC BẢN' (XUẤT HIỆN 1 LẦN)")
print("═══════════════════════════════════════════════════════════════════")

# Bỏ qua 35 từ gốc đã biết
ALREADY_KNOWN = {
    'payload', 'event_id', 'trace_id', 'span_id', 'causation_id', 'timestamp',
    'function', 'return', 'import', 'export', 'interface', 'class', 'object', 'array',
    'true', 'false', 'null', 'undefined', 'async', 'await', 'try', 'catch',
    'success', 'error', 'pending', 'status', 'state', 'emit', 'subscribe',
    'const', 'let', 'var', 'if', 'else', 'switch'
}

word_counts = Counter()
# Bỏ qua các ổ chứa rác để quét chuẩn vào Lõi
FORBIDDEN_DIRS = ["node_modules", ".git", "dist", "build", "archive", "_deprecated", "_legacy", "public"]

print("[~] Đang lặn sâu xuống đáy Lõi tìm Độc Bản, anh Natt chờ xí (gì_nôn_zậy)...")

for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in FORBIDDEN_DIRS]
    for f in files:
        if f.endswith(('.ts', '.js', '.na', '.json', '.sh', '.py')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    # Quét sạch chữ cái, giữ nguyên rễ từ
                    words = re.findall(r'\b[a-zA-Z_][a-zA-Z0-9_]*\b', content)
                    for w in words:
                        w_lower = w.lower()
                        # Lọc từ ngắn và từ đã biết
                        if w_lower not in ALREADY_KNOWN and len(w_lower) >= 4:
                            word_counts[w_lower] += 1
            except Exception:
                pass

# LỌC RA NHỮNG TỪ CHỈ XUẤT HIỆN ĐÚNG 1 LẦN
words_appearing_once = [word for word, count in word_counts.items() if count == 1]

# Sắp xếp theo thứ tự chữ cái A-Z cho anh Natt dễ dò
words_appearing_once.sort()

# Lấy tối đa 30.000 từ
top_30k_once = words_appearing_once[:30000]
out_path = "tools/cypher_30k_tu_doc_ban.txt"

# Gói nó lại vào file
with open(out_path, 'w', encoding='utf-8') as f:
    f.write("=== DANH SÁCH TỐI ĐA 30.000 TỪ 'ĐỘC BẢN' (CHỈ XUẤT HIỆN 1 LẦN TRONG LÕI) ===\n")
    f.write(f"Tổng số từ độc bản tìm thấy: {len(words_appearing_once)}\n")
    f.write(f"Đang hiển thị: {len(top_30k_once)} từ.\n")
    f.write("═══════════════════════════════════════════════════════════════════\n\n")
    for word in top_30k_once:
        f.write(f"   - {word}\n")

print(f"\n[+] Đã vét sạch đáy Lõi! Tìm thấy tổng cộng {len(words_appearing_once)} từ Độc Bản.")
print(f"[+] Danh sách đã được GÓI LẠI (gói_nó_lại) êm_ru vào tệp: {out_path}")
print("\n=> KẾT LUẬN: Anh Natt vào VS Code mở file 'tools/cypher_30k_tu_doc_ban.txt' lên để soi các điểm chạm bí mật nhé!")
print("═══════════════════════════════════════════════════════════════════")
