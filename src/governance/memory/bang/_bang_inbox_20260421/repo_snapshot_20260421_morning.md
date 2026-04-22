# REPO SNAPSHOT — 20260421 morning

**Generated:** 2026-04-22 22:18:56
**Repo:** /Users/thien/Desktop/Hồ Sơ SHTT/ natt-os_verANC

---

## [1] GIT STATE

```
Branch:    feat/p1.3-file-extension-validator
HEAD:      92b30d8
Origin:    92b30d8
Total commits: 743

Last 10 commits:
92b30d8 chore(bang): inbox 20260420 + cleanup scripts + audit report
7d1e8c8 docs(specs): SPEC_NATT_FORMAT v0.3 + SPEC_ONG_MAU v0.1 draft
068bee8 docs(memory): add 0-BOOT-BANG + 0-BOOT-FAMILY-MAP seed files
1439c07 chore(docs): reorg roadloading → docs/specs/roadloading
d08ef48 chore(governance): archive outdated registries + snapshots
3f6db78 refactor: move 3 SUPERSEDED artifacts out of src/ → _deprecated/ root
d24086c docs(memory/bang): Thiên Lớn audit feedback — 3 valid findings + rule SUPERSEDED flag
ebb92c6 chore(audit): session 20260420 auto reports + phase 1+3 logs
84fb27c refactor(infra,archive): fix P3 stale export + archive Thiên Lớn pre_wave3 audit
26a16a2 docs(memory/bang): session 20260420 cleanup deliverables

Working tree changes: 1
?? _bang_inbox_20260421/
```

## [2] REPO TOP-LEVEL

```
drwx------@ 71 thien  staff      2272 Apr 22 22:18 .
drwxr-xr-x@ 14 thien  staff       448 Apr 20 21:37 ..
-rw-r--r--@  1 thien  staff     12292 Apr 22 22:06 .DS_Store
-rw-r--r--@  1 thien  staff       288 Mar 23 09:53 .dockerignore
-rw-rw-r--@  1 thien  staff        35 Feb  5 08:01 .env.local
drwxr-xr-x@ 19 thien  staff       608 Apr 22 22:18 .git
-rw-r--r--   1 thien  staff      1209 Apr 20 18:50 .gitignore
-rw-r--r--   1 thien  staff     10802 Apr 17 16:06 .nattos-migration-phase2.log
-rw-r--r--   1 thien  staff     65334 Apr 17 13:40 .nattos-migration.log
drwxr-xr-x  13 thien  staff       416 Apr 14 11:30 .nattos-twin
-rwxr-xr-x@  1 thien  staff      7303 Apr 20 20:19 05-phase3-finalize.sh
-rwxr-xr-x@  1 thien  staff      8147 Apr 20 20:32 06-move-deprecated.sh
-rw-r--r--@  1 thien  staff       266 Apr  8 17:53 Dockerfile
drwxr-xr-x@  8 thien  staff       256 Apr 20 18:59 NaUion-Server
-rw-r--r--@  1 thien  staff      8836 Apr 17 15:52 README.md
drwxr-xr-x   8 thien  staff       256 Apr 20 22:00 _bang_inbox_20260420
drwxr-xr-x   3 thien  staff        96 Apr 22 22:18 _bang_inbox_20260421
drwxr-xr-x   6 thien  staff       192 Apr 20 20:33 _deprecated
-rwxr-xr-x   1 thien  staff      7654 Apr 19 17:24 apply-section-40.sh
drwxr-xr-x  11 thien  staff       352 Apr 20 22:11 archive
drwxr-xr-x@  8 thien  staff       256 Apr 20 18:59 audit
-rw-r--r--   1 thien  staff      5683 Apr 19 17:24 bridge.py
-rw-r--r--   1 thien  staff      2279 Apr 18 02:24 bypass-report-v2.txt
-rw-r--r--   1 thien  staff      3786 Apr 18 02:20 bypass-report.txt
drwxr-xr-x   7 thien  staff       224 Apr 13 11:21 config
drwxr-xr-x@  7 thien  staff       224 Apr 20 18:59 database
drwxr-xr-x@ 10 thien  staff       320 Apr 20 22:01 docs
-rw-r--r--   1 thien  staff      6451 Apr 17 15:52 dryrun-report.txt
-rw-r--r--@  1 thien  staff     11272 Apr 20 21:29 files.zip
-rw-r--r--   1 thien  staff       175 Mar 13 14:59 jest.config.cjs
-rw-r--r--   1 thien  staff       460 Apr 22 22:05 natt-os-twin.json
drwxr-xr-x  15 thien  staff       480 Apr 17 02:43 nattos-logo-final
-rw-r--r--@  1 thien  staff     10100 Apr 17 16:04 nattos-migrate-phase2.py
-rw-r--r--   1 thien  staff     20272 Apr 17 15:52 nattos-migrate.py
-rw-r--r--@  1 thien  staff     16821 Apr 19 00:10 nattos-rename-dryrun-v10.py
-rw-r--r--@  1 thien  staff     10225 Apr 18 23:49 nattos-rename-dryrun-v3.py
-rw-r--r--@  1 thien  staff     10480 Apr 18 23:51 nattos-rename-dryrun-v4.py
-rw-r--r--@  1 thien  staff     11485 Apr 18 23:53 nattos-rename-dryrun-v5.py
-rw-r--r--@  1 thien  staff     12150 Apr 18 23:56 nattos-rename-dryrun-v6.py
-rw-r--r--@  1 thien  staff     14931 Apr 18 23:59 nattos-rename-dryrun-v7.py
-rw-r--r--@  1 thien  staff     15403 Apr 19 00:01 nattos-rename-dryrun-v8.py
-rw-r--r--@  1 thien  staff      8772 Apr 18 23:08 nattos-rename-dryrun.py
-rw-r--r--@  1 thien  staff     16830 Apr 19 00:20 nattos-rename-execute.py
-rw-r--r--   1 thien  staff      2859 Apr 19 17:24 nattos-section40-FINAL.sh
drwxr-xr-x@ 11 thien  staff       352 Apr 20 18:59 nattos-server
-rw-r--r--   1 thien  staff      2588 Apr 19 17:24 nattos-sh-section45.sh
-rwxr-xr-x@  1 thien  staff    116604 Apr 19 16:52 nattos.sh
-rw-r--r--   1 thien  staff      3349 Apr 18 19:55 nattos.sira
-rw-r--r--@  1 thien  staff       600 Mar 23 08:39 nginx.conf
-rw-r--r--   1 thien  staff    174347 Apr 18 20:10 package.json
drwxr-xr-x@  3 thien  staff        96 Apr 16 15:16 packages
-rw-r--r--   1 thien  staff      9366 Apr 18 23:59 rename-preview-v.txt
-rw-r--r--   1 thien  staff     11174 Apr 19 00:11 rename-preview-v10.txt
-rw-r--r--   1 thien  staff      6106 Apr 18 23:49 rename-preview-v3.txt
-rw-r--r--   1 thien  staff      7036 Apr 18 23:52 rename-preview-v4.txt
-rw-r--r--   1 thien  staff      9654 Apr 19 00:02 rename-preview-v8.txt
-rw-r--r--   1 thien  staff         0 Apr 19 00:07 rename-preview-v9.txt
-rw-r--r--   1 thien  staff      4672 Apr 18 23:09 rename-preview.txt
-rwxr-xr-x@  1 thien  staff     17834 Apr 18 22:32 scan-node-ownership.sh
-rw-r--r--   1 thien  staff      2202 Apr 18 17:08 scan-rena-strict.py
-rw-r--r--   1 thien  staff      4661 Apr 17 15:52 scan-report.txt
drwxr-xr-x@  8 thien  staff       256 Apr 19 17:24 scripts
drwxr-xr-x@ 21 thien  staff       672 Apr 20 22:02 src
-rw-r--r--   1 thien  staff  55082522 Apr 20 19:12 src.zip
-rw-r--r--@  1 thien  staff       671 Apr  8 03:36 tsconfig.json
-rw-r--r--   1 thien  staff       248 Mar 28 03:32 tsconfig.server.json
-rwxr-xr-x   1 thien  staff      9101 Apr 18 02:32 validate-khai-3tests.py
-rwxr-xr-x   1 thien  staff      5155 Apr 18 05:09 validate-khaicell-bypass.py
-rwxr-xr-x   1 thien  staff      5482 Apr 18 02:26 validate-spec-compliance.py
-rw-r--r--@  1 thien  staff       580 Apr  7 13:07 vite.config.ts
-rw-r--r--   1 thien  staff       472 Apr  7 13:15 vite.config.vision.ts
```

## [3] src/ STRUCTURE

```
src
src/__tests__
src/__tests__/integration
src/cells
src/cells/business
src/cells/infrastructure
src/cells/kernel
src/cells/shared-kernel
src/components
src/components/admin
src/components/analytics
src/components/approval
src/components/audit
src/components/calibration
src/components/common
src/components/compliance
src/components/financial
src/components/gatekeeper
src/components/showroom
src/contexts
src/contracts
src/contracts/audit
src/contracts/comms
src/contracts/customer
src/contracts/customs
src/contracts/finance
src/contracts/hr
src/contracts/inventory
src/contracts/logistics
src/contracts/order
src/contracts/payment
src/contracts/production
src/contracts/supplier
src/contracts/tax
src/contracts/warranty
src/core
src/core/approval
src/core/audit
src/core/calibration
src/core/chromatic
src/core/conflict
src/core/dictionary
src/core/events
src/core/flow
src/core/guards
src/core/health
src/core/infrastructure
src/core/ingestion
src/core/logger
src/core/memory

Total src dirs: 653
Total src files: 1749
```

## [4] CELLS INVENTORY

```
Business cells:
analytics-cell
bom3dprd-cell
buyback-cell
casting-cell
comms-cell
compliance-cell
constants-cell
customer-cell
customs-cell
design-3d-cell
dust-recovery-cell
finance-cell
finishing-cell
hr-cell
inventory-cell
it-cell
logistics-cell
media-cell
noi-vu-cell
order-cell
payment-cell
period-close-cell
phap-che-cell
polishing-cell
prdmaterials-cell
prdwarranty-cell
pricing-cell
production-cell
promotion-cell
sales-cell
shared-contracts-cell
showroom-cell
stone-cell
supplier-cell
tax-cell
warehouse-cell
warranty-cell

Kernel cells:
ai-connector-cell
audit-cell
config-cell
khai-cell
monitor-cell
neural-main-cell
notification-cell
observation-cell
quantum-defense-cell
rbac-cell
security-cell

Infrastructure cells:
ai-connector-cell
event-bus-cell
index.ts
notification-cell
shared-contracts-cell
smartlink-cell
sync-cell
```

## [5] GOVERNANCE ROOT

```
-rw-r--r--   1 thien  staff   5543 Apr 17 15:52 HIEN-PHAP-NATT-OS-v5.0.anc
-rw-------   1 thien  staff   3204 Apr  2 01:13 audit-bridge.ts
-rw-r--r--@  1 thien  staff   2934 Apr  2 01:13 audit-integrity-check.ts
-rw-r--r--   1 thien  staff  10440 Apr 17 15:52 audit-log.heyna
-rw-r--r--   1 thien  staff    167 Apr 17 15:52 builder-audit-trail.heyna
-rw-r--r--   1 thien  staff   1022 Apr 17 15:52 builder-authority-lock.si
-rw-r--r--   1 thien  staff  18237 Apr 17 15:52 business.contracts.lock.si
-rw-------   1 thien  staff   2362 Apr  2 01:13 calculator.ts
-rw-------   1 thien  staff   1227 Apr  2 01:13 decay-cron.ts
-rw-r--r--   1 thien  staff   3017 Apr  2 01:13 event-causality-check.ts
-rw-r--r--   1 thien  staff   6648 Apr 17 16:06 first-seed.ts
-rw-------   1 thien  staff   3901 Apr  2 01:13 imprint-engine.ts
-rw-------   1 thien  staff   1501 Apr  2 01:13 index.ts
-rw-r--r--   1 thien  staff  10995 Apr 17 15:52 infrastructure.contracts.lock.si
-rw-r--r--   1 thien  staff   4632 Apr 17 15:52 kernel.contracts.lock.si
-rw-r--r--   1 thien  staff   8098 Apr 17 15:52 persistence.ts
-rw-------   1 thien  staff  11431 Apr  2 01:13 qneu.test.ts
-rw-------   1 thien  staff  11812 Apr  2 01:13 runtime.ts
-rw-r--r--@  1 thien  staff   2494 Apr 13 20:55 smartlink-impulse-check.ts
-rw-------   1 thien  staff   1485 Apr  2 01:13 storage.interface.ts
-rw-r--r--   1 thien  staff   8151 Apr 17 15:52 system-state.phieu
-rw-r--r--@  1 thien  staff    236 Mar  5 18:17 tsconfig.qneu.json
-rw-------   1 thien  staff   8779 Apr  7 05:05 types.ts
-rw-r--r--   1 thien  staff   3234 Apr  9 22:46 uei-compliance-check.ts
-rw-------   1 thien  staff   3078 Apr  2 01:13 validator.ts

Subfolders:
  4.0K  1 files  src/governance/amendments/
   28K  1 files  src/governance/archive/
  4.0K  1 files  src/governance/constitution/
  4.0K  1 files  src/governance/enforcement/
  4.0K  1 files  src/governance/event-contracts/
   48K  9 files  src/governance/gatekeeper/
   32M  304 files  src/governance/memory/
   16K  3 files  src/governance/policy/
   64K  12 files  src/governance/qneu/
    0B  0 files  src/governance/show-us-self/
   44K  2 files  src/governance/specs/
  4.0K  1 files  src/governance/validation/
```

## [6] BANG MEMORY LATEST

```
bangkhuong:
src/governance/memory/bang/bangkhuongv7.5.1.na
src/governance/memory/bang/bangkhuongv7.4.0.na

bangthinh:
src/governance/memory/bang/bangthinhv6.5.1.phieu
src/governance/memory/bang/bangthinhv6.5.0.phieu
src/governance/memory/bang/bangthinhv6.4.0.phieu

bangfs delta:
src/governance/memory/bang/bangfs_delta_20260420.canonical

Vet han obitan:
src/governance/memory/bang/bang-vethan-ngo-dac-tinh-giang.obitan

Boot files:
src/governance/memory/bang/0-BOOT-BANG.md
```

## [7] DOCS/SPECS

```
Active specs in docs/specs/:
docs/specs/0-BOOT-FAMILY-MAP.md
docs/specs/BRIEF_TO_BOIBOI_KHAICELL_SCAFFOLD_20260417.md
docs/specs/COLOR_SIRASIGN.md
docs/specs/MACH_HEYNA_FULL_20260416.md
docs/specs/MESSAGE_TO_KIM_20260417.md
docs/specs/NATT-OS-GROUND-TRUTH-REPORT.md
docs/specs/NATT-OS-PLATFORM-SPEC.anc
docs/specs/NATT-OS-SHTT-TECHNICAL-PACKAGE.md
docs/specs/NATT-OS_SATELLITE_COLONY_SPEC.md
docs/specs/NATT-OS_Session_Handoff_2026-03-09.md
docs/specs/NATT_OS_FILE_EXTENSIONS_SPEC_v0.1.md
docs/specs/QIINT-DINH-NGHIA-CHINH-THUC.md
docs/specs/REPLY_TO_KIM_20260417.md
docs/specs/SPEC_DUOI_FILE_v0.2_4TANG.md
docs/specs/SPEC_DUOI_FILE_v0.3_FINAL.md
docs/specs/SPEC_NATT_FORMAT_v0.3_FINAL.md
docs/specs/SPEC_NEN_v1.1_TONG_HOP_20260418.md
docs/specs/SPEC_NGON_NGU_NATT-OS_v1.2_NA.md
docs/specs/SPEC_Nauion_Render_Stack_v0.1.md
docs/specs/SPEC_ONG_MAU_v0.1.md
docs/specs/THIENBANG_MAPPING_v1_canonical_answers.md
docs/specs/TamLuxury_CellRegistry_2026-03-09.md
docs/specs/phase5-resonance-protocol.md
docs/specs/uei_architecture_spec_20260309.md
docs/specs/uei_runtime_spec_20260309.md

Subfolders:
  2 files  docs/specs/Vision/
  2 files  docs/specs/business/
  2 files  docs/specs/finance/
  1 files  docs/specs/governance/
  6 files  docs/specs/nauion/
  2 files  docs/specs/quantum/
  23 files  docs/specs/roadloading/
  1 files  docs/specs/satellite/
```

## [8] BANG INBOX 20260420

```
drwxr-xr-x   8 thien  staff   256 Apr 20 22:00 .
drwx------@ 71 thien  staff  2272 Apr 22 22:18 ..
-rw-r--r--@  1 thien  staff  6148 Apr 20 22:00 .DS_Store
-rw-r--r--   1 thien  staff  3147 Apr 20 21:50 README_BANG_FLAG_20260420.md
-rw-------@  1 thien  staff  2736 Apr 20 21:45 heyna-client-v2.patch.md
-rw-------@  1 thien  staff  3590 Apr 20 21:45 heyna-envelope-v2.types.ts
-rw-------@  1 thien  staff  4123 Apr 20 21:45 heyna-gateway-verify.draft.ts
-rw-------@  1 thien  staff  1146 Apr 20 21:45 registry.json
```

## [9] ARCHIVE STATE

```
archive/:
apps
bang-drafts-20260420
docs
legacy-zips-20260420
memory_20260313_131217
natt-os_ver2goldmaster
scripts
specs
src-governance-20260420

archive/src-governance-20260420/:
archive/src-governance-20260420/natt-master-registry-v2.sira
archive/src-governance-20260420/show-us-self/snapshot-20260419-160958.anc
archive/src-governance-20260420/show-us-self/snapshot-20260419-162240.anc
archive/src-governance-20260420/show-us-self/snapshot-20260419-162259.anc
archive/src-governance-20260420/registry-summary.sira

_deprecated/ (outside src):
2026-02-11_pre-wave3-cleanup-SUPERSEDED.md
2026-04-20_pre_wave3_dry_audit_SUPERSEDED_RULE.py
README.md
SPEC_QIINT2_v1.0_NEEDS_REWRITE.md
```

## [10] CANONICAL CHECKPOINT

```
OK  [5543B]  src/governance/HIEN-PHAP-NATT-OS-v5.0.anc
OK  [14432B]  src/governance/specs/SPEC_NEN_v1.1.anc
OK  [28372B]  src/governance/specs/SPEC_NGON_NGU_v1.2.kris
OK  [13808B]  src/thienbang.si
OK  [23982B]  src/SuperDictionary.ts
OK  [5054B]  src/core/events/event-bus.ts
OK  [1870B]  src/core/events/event-envelope.ts
OK  [6397B]  src/core/nauion/nauion.dictionary.ts
```

## [11] HEYNA FILES

```
./_bang_inbox_20260420/heyna-client-v2.patch.md
./_bang_inbox_20260420/heyna-envelope-v2.types.ts
./_bang_inbox_20260420/heyna-gateway-verify.draft.ts
./nattos-server/app Tâm luxury/services/heynaConnector.ts
./nattos-server/apps/tam-luxury/heyna-client.js
./src/governance/audit-log.heyna
./src/governance/builder-audit-trail.heyna
```

## [12] AUDIT REPORTS LATEST

```
-rw-r--r--  1 thien  staff  432 Apr 22 22:05 audit/reports/2026-04-22_22-05-23_auto.md
-rw-r--r--  1 thien  staff  432 Apr 20 20:06 audit/reports/2026-04-20_20-06-35_auto.md
-rw-r--r--  1 thien  staff  432 Apr 20 19:39 audit/reports/2026-04-20_19-39-29_auto.md
-rw-r--r--  1 thien  staff  432 Apr 20 19:07 audit/reports/2026-04-20_19-07-17_auto.md
-rw-r--r--  1 thien  staff  432 Apr 20 18:56 audit/reports/2026-04-20_18-56-44_auto.md
```

---

Generated by: Bang snapshot v1.0
Causation: BANG-SNAPSHOT-20260421-MORNING
