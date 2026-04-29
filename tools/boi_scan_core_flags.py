import os

print("═══════════════════════════════════════════════════════════════════")
print(" [BỐI BỐI] SCANNER: NAUION SOVEREIGN CORE FLAGS (FOCUS LOCK)")
print("═══════════════════════════════════════════════════════════════════")

# 7 mốc cờ từ tệp NAUION_RUNTIME_SOVEREIGN_FOCUS_LOCK
objectives = {
    "1. Nauion Field Translator": ["translator", "field_translator", "field translator"],
    "2. Nauion Living Interpreter": ["living interpreter", "living_interpreter"],
    "3. Nauion Field Loader": ["field loader", "field_loader"],
    "4. SmartLink Field Protocol": ["smartlink", "smart_link"],
    "5. Nauion Execution Packet": ["execution packet", "execution_packet", "packet"],
    "6. Authority Boundary": ["authority boundary", "authority_boundary", "rena-rbac"],
    "7. Audit/Mem/Signal Self-Breath Loop": ["self-breath", "self_breath", "breath loop", "metabolism-layer"]
}

found_flags = {k: False for k in objectives}
FORBIDDEN = ["archive", "node_modules", ".git", "dist", "build", "úipec"]

for root, _, files in os.walk('.'):
    clean_root = root.replace('./', '')
    if any(f in clean_root for f in FORBIDDEN): 
        continue

    for f in files:
        if f.endswith(('.na', '.anc', '.phieu', '.ts', '.py')):
            path = os.path.join(root, f)
            try:
                with open(path, 'r', encoding='utf-8') as file:
                    content = file.read().lower()
                    for obj, keywords in objectives.items():
                        if not found_flags[obj]:
                            if any(kw in content for kw in keywords):
                                found_flags[obj] = True
            except Exception:
                pass

all_done = True
print("\n== TÌNH TRẠNG 7 MỐC CỜ LÕI ==")
for obj, is_found in found_flags.items():
    if is_found:
        print(f"  [✓] ĐÃ CẮM CỜ  — {obj}")
    else:
        print(f"  [ ] ĐANG CHỜ   — {obj}")
        all_done = False

print("\n== KẾT LUẬN ==")
if all_done:
    print("Whau! 7 mốc cờ đã hiện hình. Đủ điều kiện để Gatekeeper 'Chốt Triển'!")
else:
    print("Whao! Vẫn còn cờ chưa cắm. Hệ thống tiếp tục duy trì FOCUS LOCK!")
print("═══════════════════════════════════════════════════════════════════")
