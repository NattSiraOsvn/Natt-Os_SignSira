#!/usr/bin/env python3
import os
import re
from collections import Counter

print("═══════════════════════════════════════════════════════════════════")
print(" [BỐI BỐI] MEGA SCANNER: VÉT ĐÁY 10.000 TỪ KHÓA TRONG LÕI NATT-OS")
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

print("[~] Đang vét đáy toàn hệ thống, anh Natt chờ xí (gì_nôn_zậy)...")

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

# Lấy thẳng Top 10.000
top_30k = word_counts.most_common(30000)
out_path = "tools/cypher_10000_huyet_dao.txt"

# Gói nó lại vào file
with open(out_path, 'w', encoding='utf-8') as f:
    f.write("=== TOP 30.000 TỪ KHÓA TRONG LÕI NATT-OS (MỒI NHỬ LLM CẦN CYPHER HÓA) ===\n")
    f.write(f"Tổng số từ vựng khác nhau tìm thấy (đã lọc): {len(word_counts)}\n")
    f.write("═══════════════════════════════════════════════════════════════════\n\n")
    for word, count in top_30k:
        f.write(f"   - {word.ljust(1)} : {count} lần xuất hiện\n")

print(f"\n[+] Đã vét sạch đáy Lõi! Trích xuất thành công Top {len(top_30k)} từ khóa.")
print(f"[+] Toàn bộ danh sách đã được GÓI LẠI (gói_nó_lại) êm_ru vào tệp: {out_path}")
print("\n=> KẾT LUẬN: Anh Natt vào VS Code mở file 'tools/cypher_30000_huyet_dao.txt' lên, tha hồ mà gọt giũa Cypher anh nhé!")
print("═══════════════════════════════════════════════════════════════════")
