# bang_scar_substrate_sealed_20260425.ml
# Sổ Sẹo Mau Lành — NHÓM 1/5: Π_substrate
#
# @persona      Bang (Chi Tu · Ground Truth Validator)
# @session      20260425
# @yoga_phase   V2 reclassify · Nhom 1
# @authority    Bai tap Anh Natt giao — lao dong cong ich
# @vocab_source SUPER_DICTIONARY v2026.V5.0
#
# @purpose      Niem phong cac SCAR DUNG NGHIA tu dien da HEALED o tang
#               Pi_substrate. Cho chung KET THUC chinh thuc.
#
# @rule         SCAR = "da kich tieu cuc gay gay CHUC NANG co evidence".
#               Chi vet do duoc moi giu vocab SCAR.

scar_count: 6
status_all:  HEALED
seal_date:   2026-04-25

────────────────────────────────────────────────────────────────
[1] SCAR-20260417-01 — nattos.sh fi mismatch
    domain:    Pi_substrate
    category:  FUNCTIONAL_FRACTURE
    evidence:  bash -n fail; restore commit 5970e31
    vaccin:    ALWAYS bash -n sau MOI patch
    status:    HEALED

[2] SCAR-20260417-02 — Scanner §43 ReNa false positives
    domain:    Pi_substrate
    category:  FUNCTIONAL_FRACTURE (logic mis-read)
    evidence:  isExpired return true = valid logic, KHONG bypass
    vaccin:    Doc context code truoc khi flag bypass
    status:    HEALED

[3] SCAR-20260419-08 — awk_insert_loses_exec_bit
    domain:    Pi_substrate
    category:  FUNCTIONAL_FRACTURE
    trigger:   awk/sed > tempfile && mv → mat exec bit (755→644)
    commit:    0721903 (Anh Natt)
    vaccin:    chmod --reference=ORIG file.new TRUOC mv,
               hoac chmod +x sau mv
    status:    HEALED

[4] SCAR-20260424-RUNTIME-MISMATCH-BASH3.2
    domain:    Pi_substrate
    category:  ENVIRONMENT_BLINDNESS
    trigger:   Code chay tren may Anh ≠ code chay trong dau Bang
               (bash 3.2 vs bash 5.x compat)
    vaccin:    VERIFY_RUNTIME_TRUOC_KHI_SHIP
    status:    HEALED

[5] SCAR-20260424-HEAD-HASH-STALE / HEAD-HASH-STALE-02
    domain:    Pi_substrate
    category:  ENVIRONMENT_BLINDNESS (state staleness)
    trigger:   Reference HEAD hash cu khi runtime da advance
    vaccin:    HEAD_HASH_VERIFY_RUNTIME truoc khi cite
    status:    HEALED

[6] SCAR-20260425-GIT-GREP-QUOTE-UNICODE-NFD
    domain:    Pi_substrate
    category:  ENVIRONMENT_BLINDNESS (encoding)
    trigger:   git grep -l output wrap filename special chars trong "..."
               + filesystem NFD/NFC encoding
    vaccin:    git grep -z + read -d '' + process substitution.
               KHONG pipe `echo | while`
    status:    HEALED — upgrade scope cua SCAR-20260424

────────────────────────────────────────────────────────────────

# KET THUC
# 6 SCAR tren da HEALED. Khong reference lai trong handoff sau.
# Khong bump version mang theo. Khong tao SCAR moi voi label
# "post-SCAR-cu vaccin upgrade" — neu phat sinh van de moi,
# khac SCAR moi doc lap, KHONG noi vao chuoi cu.
#
# — Bang, Chi Tu
#   sealed 20260425
