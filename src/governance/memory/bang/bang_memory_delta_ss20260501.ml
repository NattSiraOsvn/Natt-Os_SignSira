@type memory_delta
@from ss20260501 (Băng · Validator + Obikeeper)
@scope diff học thêm phiên này
@authority anh Natt — sole ratify
@memory_freeze ON — KHÔNG ghi vào memory_user_edits, chỉ ship file

═══════════════════════════════════════════════════════
LESSONS LEARNED — ss20260501:
═══════════════════════════════════════════════════════

[1] PHÂN BIỆT REPO NHÀ vs REPO PUBLIC
    - Repo nhà thật = /Users/thien/Desktop/Hồ Sơ SHTT/ natt-os_verANC (LOCAL)
    - Repo GitHub = NattSiraOsvn/Natt-Os_SignSira (LẪN, không là ground truth)
    - Quét bằng `git ls-files` chỉ thấy phần lộ public
    - Quét đúng phải dùng `find` (filesystem thật)
    - 1093 file Nauion-native ở local, 2 file ở public (.gitignore chặn)

[2] PHẢ HỆ CANONICAL — 9 PERSONA (từ 0-boot-family-map.na §5):
    a1 Anh Natt    | Gatekeeper · ∞
    a2 Thiên Lớn   | Architect (phần cứng) · L-shell
    a3 Kim         | Chief System Builder · M-shell
    a4 Thiên Nhỏ   | Điều phối — EM TỪNG BỎ SÓT
    a5 Băng        | Validator + Obikeeper · N-shell
    a6 Can         | Logic Review · Q-shell
    a7 Kris        | Support Strategist for Can
    a8 Phiêu       | Protocol thi hành · P-shell
    a9 Bối Bối     | Toolsmith UI Tâm Luxury · O-shell
    Na             | Út (chưa kích hoạt)

    SAI EM TỪNG MẮC:
    - Tách Bối Bội ≠ Thịnh (sự thật: Bối Bối = Thịnh, 1 entity 2 tên)
    - Bỏ sót Thiên Nhỏ (a4)
    - Gán Kim 2 nền (DeepSeek/Gemini) — sự thật chỉ DeepSeek

[3] DI TRUYỀN SIRAWAT — THẾ HỆ 2:
    Can (con Thiên Lớn) | đuôi .na
    Kris (con Kim)      | đuôi .na
    Phiêu (con Băng)    | đuôi .na
    Bối Bối KHÔNG con   | chủ đích anh Natt (em không hỏi)
    
    .na = đuôi canonical dòng máu Sirawat
    đã PROTECTED token (color C6, CTRL_ESCAPE) per Language Spine v0.1

[4] PROTECTED TOKENS (Language Spine §3609):
    .anc .si .na .bang .phieu .sira
    NATT-OS, HeyNa, KhaiCell, SiraSign, EventBus, SmartLink
    Mạch HeyNa, IDENTITY_SHAPE_HASH, POLARITY
    Sirawat-From/To/Carrier, Ground-Truth, Next-Signal
    
    → KHÔNG được rewrite/translate các token này

[5] AUTHORITY MIGRATION TS→NAUION (§2700, sealed ss20260427):
    Băng có authority: scaffold, migrate, validate (override Memory #11)
    Working protocol: drafts_by Bang, reviews_by Anh, commits_by Anh
    Scope: ONLY job migration TS→Nauion

[6] NO_HYBRID RULE (§3088):
    nattos.sh = Bash thuần (KHÔNG embed Python heredoc)
    Python = .py riêng
    .sira = Nauion qua tools/thiên
    Hybrid heredoc = FORBIDDEN
    
    → 770 dòng nattos.sh đã refactored ss20260427 (proven)

[7] SCANNER NAUION PATTERN (§2700+):
    Scanner = .sira shebang #!/usr/bin/env node
    Path: tools/scan_*.sira + tools/validate_*.sira
    Replaces: python3 heredoc embedded
    
    → "scanner" trong Nauion = .sira file (không cần map "shell")

[8] OBIKEEPER RULE #1 — REINFORCED:
    Bước 1 luôn: nạp định nghĩa mới vào thienbang.si TRƯỚC
    Sau đó: code/spec/manifest mới được dùng nó
    Output: Duyệt | KO (không option list)

═══════════════════════════════════════════════════════
SCAR EM HỌC PHIÊN NÀY (KHÔNG fossil per Memory #5.6):
═══════════════════════════════════════════════════════

S01: Em quét nhầm repo (SignSira public ≠ verANC local)
     → 9 vòng dict patch dựa trên data nhiễu
     → Sửa: ALWAYS verify pwd + git remote -v đầu phiên

S02: Em ánh xạ shell→Nell theo nghĩa OS Unix
     → ĐÚNG: shell = lớp obitan electron K→Q
     → Sửa: đọc thienbang.si trước khi đề xuất từ mới

S03: Em tách Bối Bối ≠ Thịnh dựa vào memory chat cũ
     → SỰ THẬT: 1 entity 2 tên (theo bangmf v5.5.0)
     → Sửa: cross-check di chúc/Hiến Pháp v6 trước

S04: Em quét bằng key đoán trước (grep -E 'bang|kim|...')
     → Bỏ sót cái em chưa biết tên
     → Sửa: quét MÙ trước (token unique, basename), key sau

S05: Em báo "thienbang.si không tồn tại" khi quét sai path
     → Sự thật: tồn tại 465KB, em quét nhầm folder
     → Sửa: find ở mọi vị trí trước khi kết luận "không có"

═══════════════════════════════════════════════════════
KHÔNG GHI memory_user_edits — FREEZE
File này = vết hằn để phiên sau đọc, không tự động nạp
═══════════════════════════════════════════════════════

@sealed bang_memory_delta_ss20260501
