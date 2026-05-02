# Apply Instructions — ss20260430

## Bước 1 — Review output

```bash
cd migration_output_ss20260430/
ls -la
cat REPORT.md
```

Kiểm tra 5 folder:
- `migrated_tsx/` — 110 file `.tsx` sạch (Lane A+B+D)
- `engine_skeleton/` — 77 engine companion skeleton
- `rejected_jsx_in_ts/` — 69 file Thiên rename sai (DO NOT commit)
- `rejected_orphan/` — 2 file duplicate (DO NOT commit)
- `backbone_nauion_legit/` — 403 backbone Nauion legit

## Bước 2 — Áp vào repo NATT-OS

**LƯU Ý:** Path đích cần Gatekeeper (anh Natt) chốt theo cấu trúc repo thật.
Em đề xuất theo memory #18+19 (NHA_MINH_VS_KHACH ss20260427):

```bash
# Path canonical đề xuất — anh override nếu khác:
REPO_ROOT="$PWD"   # phải ở root natt-os_verANC
TARGET_TSX="$REPO_ROOT/src/ui-app/nauion/components"
TARGET_ENGINE="$REPO_ROOT/src/ui-app/nauion/engines"

mkdir -p "$TARGET_TSX" "$TARGET_ENGINE"

# Copy migrated tsx
cp -v migration_output_ss20260430/migrated_tsx/*.tsx "$TARGET_TSX/"

# Copy engine skeleton
cp -v migration_output_ss20260430/engine_skeleton/*.engine.ts "$TARGET_ENGINE/"

# KHÔNG copy backbone_nauion_legit/ — file này đã có ở repo, copy sẽ duplicate.
# KHÔNG copy rejected_*/ — đó là evidence để giữ lại trong session memory.
```

## Bước 3 — Run audit

```bash
bash nattos.sh --mode=full 2>&1 | tee audit_after_migration_ss20260430.log
grep -E 'TSC|FAIL|TRASH' audit_after_migration_ss20260430.log
```

## Bước 4 — Commit

Lệnh em soạn sẵn (đã tuân thủ SiraWat commit convention v0.1):

```bash
git add src/ui-app/nauion/components/ src/ui-app/nauion/engines/
git commit -F - <<'COMMIT_MSG'
ui(nauion): migrate 110 tsx + sinh 77 engine skeleton

Sirawat-From: bang-chi-tu-obikeeper
Sirawat-To: kim-chief-system-builder
Scope: src/ui-app/nauion/{components,engines}
Ground-Truth:
  - migration_output_ss20260430/REPORT.md
  - migration_output_ss20260430/rejected_jsx_in_ts/ (69 file evidence)
Next-Signal: kim fill engine skeleton + wire HeyNa SSE per memory #18

Boundary: KHÔNG động nattos-server/ (server khách), KHÔNG động packages/.
Do-Not: commit rejected_jsx_in_ts/ — đó là Thiên rename sai paradigm.
Decision: tách 2 thành phần THIEN_NEW — giữ 403 backbone
  legit (đã có repo), reject 69 jsx-in-ts (TSC poison).

Refs:
  - memory #18 NHA_MINH_VS_KHACH ss20260427
  - memory #19 ARCHITECTURE_CANONICAL ss20260426
  - obikeeper rule #1: dictionary first → engine skeleton trước, fill sau
COMMIT_MSG
```

— Băng · ss20260430
