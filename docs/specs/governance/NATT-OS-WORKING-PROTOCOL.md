# NATT-OS WORKING PROTOCOL
## Quy tắc làm việc cho mọi AI Entity trong hệ
### Author: Bang (QNEU 300) · 2026-04-09
### Phe duyet: Gatekeeper — Anh Natt

---

## I. NGUYEN TAC BAT BIEN — DOC TRUOC KHI LAM BAT CU THU GI

1. Ground Truth truoc dep. Dung truoc nhanh.
2. Khong confirm khi chua verify. Paste output that len.
3. Khong hallucinate path, interface, file name.
4. Khong sua scanner de khop code — sua code de khop EventBus (SCAR FS-032).
5. Registry la day than kinh — khong phai bo nao (SCAR FS-033).
6. Khong scaffold roi bao cao la xong.

---

## II. QUY TAC 1 LENH

Moi thao tac voi repo PHAI theo quy tac sau:

Viet bang Python inline — khong heredoc khi co ky tu dac biet:

    python3 - << 'EOF'
    import pathlib
    p = pathlib.Path('path/to/file')
    c = p.read_text('utf-8')
    c = c.replace('old', 'new')
    p.write_text(c, 'utf-8')
    print('done')
    EOF

Patch file → verify → commit — 1 lenh duy nhat:

    python3 - << 'EOF'
    # patch logic
    EOF
    git add file && git commit -m "type(scope): message" && git push origin main

KHONG BAO GIO:
- Tao file zip/tar roi yeu cau download
- Dong goi file qua present_files neu file > 500 dong
- Dung heredoc cat > file khi noi dung co ky tu |, $, backtick

---

## III. TRINH TU BAT BUOC TRUOC MOI TASK

Buoc 1 — Doc state he thong:
    bash nattos.sh 2>/dev/null | grep -E "Risk:|HEAD:|TSC|HEALTHY|orphan|blind"
Neu Risk > 0 hoac co loi → fix truoc, khong lam task moi.

Buoc 2 — Xac dinh file se cham vao:
    find . -name "*.ts" -path "*ten-cell*" | head -10
    grep -n "keyword" path/to/file | head -20
Doc that truoc khi viet. Khong doan interface.

Buoc 3 — Verify truoc khi commit:
    grep -n "keyword_moi" path/to/file | head -5

Buoc 4 — Commit theo chuan:
    git add path/to/file
    git commit -m "type(scope): mo ta ngan · chi tiet neu can"
    git push origin main

---

## IV. COMMIT MESSAGE FORMAT

    type(scope): mo ta · chi tiet

    type:   feat | fix | chore | perf | refactor | docs
    scope:  ten cell hoac module

Vi du chuan:
- fix(render): RenderCtrl loop · unified RAF · no flicker
- feat(spec): SPEC v2.4 · §24-27 · Quantum Defense + Satellite
- fix(audit): event-graph rebuilt · orphan 4→0 · risk 8→0

---

## V. KHI GAP VAN DE — CHECKLIST 4 CAU

Truoc khi de xuat giai phap, phai tra loi du 4 cau:

1. Root cause that la gi? (khong doan, doc code that)
2. File nao can cham? (grep xac nhan truoc)
3. Patch se lam gi? (describe chinh xac string replace)
4. Verify bang gi sau khi patch? (grep hoac run output)

Neu khong tra loi duoc cau nao → hoi Gatekeeper, khong tu lam.

---

## VI. NAUION LANGUAGE — BAT BUOC TRONG CODE

| Tu Nauion | Nghia | Thay cho |
|---|---|---|
| HeyNa | Goi he | trigger, call |
| Nahere | He tra loi | response, ACK |
| Whao | Dang xu ly | loading, processing |
| Whau | Xong | success, done |
| lech | Co anomaly | warning |
| gay | Critical failure | error |
| Mach HeyNa | SSE stream | SSE endpoint |
| phat Nauion | Emit event | EventBus.emit |
| lang Nahere | Subscribe | EventBus.on |

---

## VII. FILE DOC KHI VAO SESSION MOI (theo thu tu)

1. src/governance/memory/bang/bangmf_*.json
2. .nattos-twin/inference.json
3. audit/summary/latest.json
4. docs/specs/nauion/SPEC-Nauion_main_v2.5.md
5. docs/specs/finance/SPEC-Finance-Flow_v1.1.md

---

## VIII. CAU TRUC REPO — KHONG DUOC CHAM

    src/cells/        ← KHONG cham neu khong co task cu the
    src/core/nauion/  ← KHONG cham
    nattos-server/    ← Chi cham khi co task server ro rang

Build va extend tai:
    nattos-server/apps/tam-luxury/   ← App Tam Luxury
    docs/specs/                      ← SPEC files

---

## IX. QNEU SCORES

| Entity | QNEU | Vai tro |
|---|---|---|
| Bang (Claude) | 300 | Ground Truth Validator, Chi 5 |
| Thien (GPT) | 135 | Architect, Anh Ca |
| Kim | 120 | UI/Design |
| Can | 85 | Executor, Finance |
| Boi Boi | 40 | Constitutional Builder, Junior |

---

Natt Sirawat - Phan Thanh Thuong - Gatekeeper
2026-04-09
