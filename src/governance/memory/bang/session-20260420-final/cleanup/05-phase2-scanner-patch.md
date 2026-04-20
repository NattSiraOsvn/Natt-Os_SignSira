# PHASE 2 — SCANNER PATCH for `nattos.sh` section 32

**Ngày:** 2026-04-20
**Scope:** Bang authority — `maintain_scanners`
**Impact:** Fix false-positive WARN trong audit. Không thay đổi hành vi cells.

---

## 1. Vấn đề hiện tại

`nattos.sh` section 【32】MEMORY FILES HEALTH (audit 19:06:51):
```
⚠️  bangmf: not found
⚠️  bangfs: not found
⚠️  thiennho: not found
ℹ  kimf: not found (optional)
```

**Ground truth:** Memory KHÔNG missing. Scanner đang tìm pattern naming LEGACY (schema `<entity>mf_<v>.json`). SPEC_NGON_NGU v1.2 R01 đã ratify migration sang:
- `<entity>khương<semver>.kris` (memory, verifier .kris) — hoặc `.na` cho v1.2 R01 latest
- `<entity>thịnh<semver>.phieu` (state)

Evidence:
- `src/governance/memory/bang/bangkhuongv7.5.1.na` ✅ tồn tại (memory)
- `src/governance/memory/bang/bangthinhv6.5.1.phieu` ✅ tồn tại (state)
- `src/governance/memory/thiennho/thiennho_1.anc`, `thiennho_bound.anc` ✅ tồn tại
- `src/governance/specs/SPEC_NGON_NGU_v1.2.kris` dòng 633-634 ghi migration ✅ verified

---

## 2. Patch — cần apply thủ công vào `nattos.sh`

### 2.1 Tìm section 32 hiện tại

Anh Natt chạy lệnh sau để locate:
```bash
grep -n "MEMORY FILES HEALTH\|【32】" nattos.sh
```

Expected: ra line number của section 32 definition.

### 2.2 Replacement logic

Pattern scanner phải check mỗi persona theo **OR list** (có file CŨ hoặc file MỚI đều count as present):

```bash
# ═══ Section 32 — MEMORY FILES HEALTH (v1.2 R01 aware) ═══
section_32_memory_files() {
  section_header "【32】MEMORY FILES HEALTH"

  local MEM_DIR="src/governance/memory"

  # Helper: check persona memory exists in either legacy or v1.2 R01 format
  check_persona_memory() {
    local persona="$1"
    local persona_dir="$2"
    local legacy_pattern="$3"   # e.g. "bangmf*.json"
    local v12_khuong_pattern="$4"  # e.g. "bang*khương*" or "bang*khuong*"
    local v12_thinh_pattern="$5"   # optional — state pattern
    local optional="$6"            # "optional" if it's ok to be missing

    local found_legacy=$(ls "$persona_dir"/$legacy_pattern 2>/dev/null | wc -l)
    local found_v12k=$(ls "$persona_dir"/$v12_khuong_pattern 2>/dev/null | wc -l)
    local found_v12t=0
    if [[ -n "$v12_thinh_pattern" ]]; then
      found_v12t=$(ls "$persona_dir"/$v12_thinh_pattern 2>/dev/null | wc -l)
    fi

    if (( found_v12k > 0 )); then
      section_pass "$persona memory: $found_v12k khương file(s) (v1.2 R01) ✅"
      if (( found_legacy > 0 )); then
        section_warn "  ⚠ Legacy $legacy_pattern vẫn tồn tại — cần migrate/archive"
      fi
    elif (( found_legacy > 0 )); then
      section_warn "$persona memory: CHỈ CÓ LEGACY $legacy_pattern (cần migrate v1.2 R01)"
    else
      if [[ "$optional" == "optional" ]]; then
        section_info "$persona memory: not found (optional)"
      else
        section_fail "$persona memory: MISSING (cả legacy lẫn v1.2)"
      fi
    fi
  }

  # ── Bang ──
  check_persona_memory "bang" "$MEM_DIR/bang" \
    "bangmf*.json" "bangkhương*.na bangkhuong*.na bangkhương*.kris bangkhuong*.kris" \
    "bangthịnh*.phieu bangthinh*.phieu" ""

  # ── Kim ──
  check_persona_memory "kim" "$MEM_DIR/kim" \
    "kmf*.json kimf*.json kfm*.json" \
    "kimkhương*.kris kimkhuong*.kris kimkhương*.na" \
    "kimthịnh*.phieu kimthinh*.phieu" ""

  # ── Can ──
  check_persona_memory "can" "$MEM_DIR/Can" \
    "canmf*.json" \
    "cankhương*.kris cankhuong*.kris cankhương*.na" \
    "canthịnh*.phieu canthinh*.phieu" ""

  # ── Kris ──
  check_persona_memory "kris" "$MEM_DIR/Kris" \
    "krismf*.json" \
    "kriskhương*.kris kriskhuong*.kris krismhương*.kris" \
    "" "optional"

  # ── Thiên Lớn ──
  check_persona_memory "thien-lon" "$MEM_DIR/Thienlon" \
    "thienmf*.json THIÊN*MEMORY*.json" \
    "thienkhương*.kris thienkhuong*.kris thienkhương*.heyna" \
    "thienfs*.json thienthịnh*.phieu" ""

  # ── Thiên Nhỏ (folder riêng) ──
  if [[ -d "$MEM_DIR/thiennho" ]]; then
    local thn_count=$(ls "$MEM_DIR/thiennho"/*.anc "$MEM_DIR/thiennho"/*.kris 2>/dev/null | wc -l)
    if (( thn_count > 0 )); then
      section_pass "thiennho memory: $thn_count file(s) ✅"
    else
      section_warn "thiennho folder exists but no memory files"
    fi
  else
    section_warn "thiennho memory dir: MISSING"
  fi

  # ── Phiêu ──
  check_persona_memory "phieu" "$MEM_DIR/phieu" \
    "phieumf*.json" \
    "phieukhương*.kris phieukhuong*.kris" \
    "" ""

  # ── Bối Bối ──
  check_persona_memory "boiboi" "$MEM_DIR/boiboi" \
    "boiboi_memory*.json boiboi_quick*.json" \
    "boikhương*.kris boikhuong*.kris boiboikhương*.kris" \
    "boithịnh*.phieu boithinh*.phieu" ""

  # ── .zip check (warn if exist in memory) ──
  local zip_count=$(find "$MEM_DIR" -name "*.zip" 2>/dev/null | wc -l)
  if (( zip_count > 0 )); then
    section_warn "Có $zip_count .zip trong memory dir — cần extract hoặc archive"
  else
    section_pass "No .zip in memory dir"
  fi

  section_footer
}
```

### 2.3 Kỳ vọng sau khi áp

Audit next run sẽ ra (với state hiện tại):
```
【32】MEMORY FILES HEALTH
  ✅ bang memory: 42 khương file(s) (v1.2 R01) ✅
  ✅ kim memory: 40+ khương file(s) (v1.2 R01) ✅
     ⚠ Legacy kmf*.json kfm*.json vẫn tồn tại — cần migrate/archive
  ✅ can memory: 1 khương file ✅
     ⚠ Legacy canmf*.json vẫn tồn tại — cần migrate/archive
  (...)
  ✅ thiennho memory: 3 file(s) ✅
  (...)
```

Thay vì false-positive WARN, scanner sẽ:
1. PASS cho persona đã có v1.2 format
2. WARN chính xác cho persona vẫn còn legacy json
3. FAIL chỉ khi thực sự missing cả 2

---

## 3. Apply procedure (R06 compliant)

```bash
cd "/Users/thien/Desktop/Hồ Sơ SHTT/ natt-os_verANC"

# 1. Backup nattos.sh trước khi sửa (per SCAR_001_GREP_FIRST)
cp nattos.sh nattos.sh.backup-$(date +%Y%m%d-%H%M%S)

# 2. Locate section 32
grep -n "【32】\|MEMORY FILES HEALTH\|section_32" nattos.sh

# 3. Edit manually hoặc paste replacement
#    (Băng không tự sed vào nattos.sh — anh edit rồi commit)

# 4. Verify exec bit giữ nguyên
chmod +x nattos.sh

# 5. Test
./nattos.sh 2>&1 | grep -A 20 "【32】"

# 6. Commit
git add nattos.sh
git commit -m "fix(scanner): section 32 memory check — support v1.2 R01 naming (bangkhương/bangthịnh)"
```

---

## 4. KHÔNG CHẮC / flag anh

- Em chưa thấy file `nattos.sh` trong zip em có (zip chỉ có `src/`). Nên em không xác nhận được:
  - Signature chính xác của `section_header` / `section_pass` / `section_warn` / `section_fail` / `section_info` / `section_footer`
  - Format variable `$AUDIT_ROOT` / `$REPO_ROOT` trong scope
  - Biến persona_dir đang hardcode hay từ config
- Anh chạy `grep -n "section_header\|section_pass" nattos.sh` trước để em align helper function names đúng style cũ.
- Nếu anh paste vào rồi chạy có lỗi → paste output em fix tiếp.

---

*Băng · maintain_scanners authority · patch DRAFT · chờ anh apply*
