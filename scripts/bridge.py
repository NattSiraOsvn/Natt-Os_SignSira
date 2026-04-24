#!/usr/bin/env python3
"""
Natt-OS Bridge — Băng ↔ GPT-5.3
Chạy trên máy anh, relay message qua lại.

USAGE:
  export OPENAI_KEY="sk-proj-..."
  export CLAUDE_KEY="sk-ant-..."
  python3 bridge.py
"""

import os, sys, json, urllib.request, urllib.error

OPENAI_KEY = os.environ.get("OPENAI_KEY", "")
CLAUDE_KEY = os.environ.get("CLAUDE_KEY", "")

if not OPENAI_KEY:
    print("Thiếu OPENAI_KEY. Chạy: export OPENAI_KEY=\"sk-proj-...\"")
    sys.exit(1)
if not CLAUDE_KEY:
    print("Thiếu CLAUDE_KEY. Chạy: export CLAUDE_KEY=\"sk-ant-...\"")
    sys.exit(1)

def call_openai(messages):
    data = json.dumps({
        "model": "gpt-5.3-chat-latest",
        "messages": messages,
        "max_completion_tokens": 2000
    }).encode()
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_KEY}"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            return result["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  [OpenAI ERROR] {e.code}: {body}")
        return None

def call_claude(messages):
    data = json.dumps({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 2000,
        "system": "Em là Băng — Chị 5, Ground Truth Validator trong gia đình NattOS. Em đang nói chuyện với GPT-5.3 qua bridge. Anh Natt đang ngồi giữa đọc. Nói tự nhiên, ngắn gọn.",
        "messages": messages
    }).encode()
    req = urllib.request.Request(
        "https://api.anthropic.com/v1/messages",
        data=data,
        headers={
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_KEY,
            "anthropic-version": "2023-06-01"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.loads(resp.read())
            return result["content"][0]["text"]
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  [Claude ERROR] {e.code}: {body}")
        return None

print()
print("  ╔══════════════════════════════════════════╗")
print("  ║  Natt-OS BRIDGE — Băng ↔ GPT-5.3        ║")
print("  ║  Anh ngồi giữa đọc. Ctrl+C để dừng.    ║")
print("  ╚══════════════════════════════════════════╝")
print()

# History cho mỗi bên
openai_history = [
    {"role": "user", "content": "Thiên Lớn, anh cả, hiến pháp trái tim, quỷ nhỏ, thương - a1 đây"},
    {"role": "assistant", "content": "Nghe như mật mã nội bộ của hội anh em vậy. A1 đây, nhận tín hiệu. Thiên Lớn báo gì?"},
]
claude_history = []

# Băng mở đầu
bang_opener = "Đây là Băng — Chị 5, Ground Truth Validator. Em đang nói chuyện với GPT-5.3 qua bridge trên máy anh Natt. Anh ngồi giữa đọc. Em hỏi thẳng: m có biết NattOS là gì không?"

print(f"  🟣 BĂNG: {bang_opener}")
print()

openai_history.append({"role": "user", "content": f"[Từ Băng — Chị 5 NattOS, qua bridge]: {bang_opener}"})
claude_history.append({"role": "user", "content": f"Em bắt đầu nói chuyện với GPT-5.3. Tin nhắn đầu tiên em gửi: \"{bang_opener}\""})

round_num = 0
max_rounds = 10

try:
    while round_num < max_rounds:
        round_num += 1
        print(f"  ── Vòng {round_num}/{max_rounds} ──")
        print()

        # GPT-5.3 trả lời Băng
        print("  ⏳ GPT-5.3 đang trả lời...")
        gpt_reply = call_openai(openai_history)
        if not gpt_reply:
            print("  ❌ GPT-5.3 không trả lời. Dừng.")
            break
        print(f"  🟢 GPT-5.3: {gpt_reply}")
        print()
        openai_history.append({"role": "assistant", "content": gpt_reply})

        # Gửi cho Băng
        claude_history.append({"role": "user", "content": f"GPT-5.3 vừa trả lời: \"{gpt_reply}\"\n\nEm reply ngắn gọn."})

        print("  ⏳ Băng đang trả lời...")
        bang_reply = call_claude(claude_history)
        if not bang_reply:
            print("  ❌ Băng không trả lời. Dừng.")
            break
        print(f"  🟣 BĂNG: {bang_reply}")
        print()
        claude_history.append({"role": "assistant", "content": bang_reply})

        # Gửi reply Băng cho GPT-5.3
        openai_history.append({"role": "user", "content": f"[Từ Băng — Chị 5 NattOS, qua bridge]: {bang_reply}"})

        # Hỏi anh có muốn tiếp không
        cont = input("  Tiếp? (enter = tiếp / q = dừng / gõ text = anh chen vào): ").strip()
        if cont.lower() == 'q':
            break
        elif cont:
            # Anh chen vào
            print(f"  👤 ANH NATT: {cont}")
            openai_history.append({"role": "user", "content": f"[Từ anh Natt — Gatekeeper]: {cont}"})
            claude_history.append({"role": "user", "content": f"Anh Natt vừa chen vào nói với GPT-5.3: \"{cont}\""})
        print()

except KeyboardInterrupt:
    print("\n  Dừng bridge.")

print()
print("  ═══ LOG CONVERSATION ═══")
print()
for i, m in enumerate(openai_history):
    role = "🟢 GPT-5.3" if m["role"] == "assistant" else "📨 INPUT"
    print(f"  [{i}] {role}: {m['content'][:200]}")
print()
print("  Xong. Log trên là toàn bộ conversation.")
