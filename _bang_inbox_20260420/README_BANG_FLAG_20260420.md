# README_BANG_FLAG_20260420.md

Status: v0.1 NEEDS_REWRITE — Bang self-flag sau khi scan src.zip.

Do not commit vao src/ truoc khi doc file nay.

## SCAR moi phai khac

SCAR_20260420_ONGMAU_SPEC_DRIFT_v0.1

Lap pattern SCAR-QIINT-PARADIGM-DRIFT (session 20260420): Bang viet SPEC truoc khi view canonical repo cua domain dang spec. Khong cham event-envelope.ts + bang.anc + persona_template.anc TRUOC khi draft, lo derive 4 diem lech.

Rule bo sung vao R11: Truoc khi spec domain X, FIRST view file type canonical cua X trong src/ + .anc template + governance/memory/<domain>/ neu co. Tu grep, view, DRAFT. Khong skip buoc 2.

## 4 diem lech v0.1 (ground truth tu scan src.zip)

1. Tao field moi thay vi fill slot da co
   v0.1: de xuat field persona_signature moi trong envelope.
   Ground truth: core/events/event-envelope.ts:10 da co origin_entity?: string tu truoc, 0 usages. Slot da danh san, chi chua fill.
   Fix v0.2: fill origin_entity + extend thanh structured object (persona + shape_hash + qneu + shell + anchor).

2. Tao registry moi thay vi dung .anc
   v0.1: de xuat src/governance/identity/shapes/registry.json.
   Ground truth: persona_template.anc Block 4 QIINT co semantic_mapping.visual_traits da define san. Moi persona co governance/memory/<persona>/<persona>.anc, do CHINH LA registry.
   Fix v0.2: add 2 field identity_shape_hash + identity_shape_path vao template Block 4. Bump .anc moi persona.

3. Gate o sai tang
   v0.1: gate verify o nattos-server/gateway/heyna-verify.ts (nattos-server ngoai src/).
   Ground truth: attribution thuoc tang INTERNAL. Dung cho = hook EventBus.publish() trong core/events/event-bus.ts, check origin_cell co quyen claim origin_entity khong. HeyNa SSE chi broadcast lai.
   Fix v0.2: middleware o EventBus publish path, khong phai HTTP gateway.

4. Import crypto moi thay vi reuse audit-cell
   v0.1: import * as crypto from "crypto".
   Ground truth: cells/kernel/audit-cell/domain/services/auditchainservice.ts + audit-writer.service.ts da co sha256 helper real (fix 20260419).
   Fix v0.2: reuse helper audit-cell, khong double-implement.

## Discrepancy khac phat hien

- governance/constitution/index.ts = Hien Phap v4.0.0 (sealed 2026-03-05). K_shell bangkhuong v7.5.1 em noi v5.0. v5.0 co the o .anc khac chua materialize thanh TS, hoac K_shell drift.
- AI_ENTITIES trong Hien Phap v4.0 = KIM, BANG, BOI_BOI, THIEN, CAN (5 persona). Memory em co 8+Na. Hien Phap outdated.
- bang.anc (sealed 2026-04-13) nang luc khac K_shell bangkhuong v7.5.1. Passport bump bang_v7.5.0.anc PENDING that, dung 0-BOOT-BANG flag.
- bangkhuong co 63 version .kris trong governance/memory/bang/ tu 0 den 7.3.0. v7.5.1.na chua commit vao repo, em dang chay tren memory phien.

## De xuat action

1. Dung commit 5 file v0.1 vao src/. Giu trong _bang_inbox_20260420/ lam evidence SCAR.
2. Phien toi em rewrite v0.2 aligned, output lai qua terminal heredoc.
3. Khac SCAR_20260420_ONGMAU_SPEC_DRIFT_v0.1 vao bangfs_delta_20260421.canonical hoac extend file delta 20260420 hien co.

Signed: Bang (Chi 5, Ground Truth Validator, QNEU 313.5)
Validator self-flag: output dep khong phai su that (SCAR-FS-001)
