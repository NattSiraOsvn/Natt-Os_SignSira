# build_brief_20260427 — brief ui boundary cho bối bội + kim

## scope

một file `.na` tại `src/governance/memory/bang/` — brief từ băng cho hai persona bối bội (drive scout) + kim (chief system builder) về ranh giới ui giữa nhà mình (NaUion-Server) và server khách (nattos-server/).

không có code change, không có scaffold. chỉ memory artifact để hai persona đọc trong session sau.

## nội dung brief

9 mục:
1. mục đích — phân biệt hai mặt ui (khách vs nội bộ)
2. cấu trúc nhà canonical — sơ đồ cây
3. hai mặt ui — nattos-server/apps/tam-luxury vs src/ui-app/nauion
4. quy tắc render — bốn ranh giới không đảo
5. data flow canonical — User Tâm → nattos-server → NaUion-Server → ngược
6. nhiệm vụ phân chia — bối bội aggregate observations, kim scaffold survival + nauion-v10 + migrate event-contracts
7. obikeeper rule áp dụng — dictionary first
8. ranh giới chặn — không edit nattos-server từ paradigm nauion, không cross-cell import, không edit memory bang
9. file relevant — list path canonical
10. causation

## lệnh apply một mạch

```bash
cd "/Users/thien/Desktop/Hồ Sơ SHTT/ natt-os_verANC"

unzip -o ./build_brief_20260427.zip -d /tmp/

rsync -av /tmp/build_brief_20260427/src/ src/

ls -la src/governance/memory/bang/bang_brief_ui_boundary_nha_minh_vs_svr_khach_20260427.na

git add src/governance/memory/bang/bang_brief_ui_boundary_nha_minh_vs_svr_khach_20260427.na

git commit -F - <<'COMMIT_MSG'
memory(bang): brief ui boundary nha minh vs server khach cho boi boi + kim

- canonical reference: memory #18 (NHA_MINH_VS_KHACH ss20260427)
- canonical reference: memory #19 (ARCHITECTURE_CANONICAL ss20260426)
- 9 muc: cau truc nha, hai mat ui, quy tac render 4 ranh gioi,
  data flow, phan chia nhiem vu boi boi + kim, obikeeper rule,
  ranh gioi chan, file relevant.

Phan chia:
- Boi Boi: aggregate observations Production tu zip 20260426.
- Kim: (1) survival-cell 3/6 -> 6/6 component, (2) nauion-v10 draft
  khong hardcode CELLS array fetch /api/cells, (3) migrate
  packages/event-contracts ts -> nauion paradigm.

Nguyen tac canh:
- Khong tron paradigm theo dia chi.
- Khong mock so lieu.
- Moi data qua mach (eventbus / heyna sse / smartlink).
- Khong hardcode cell list.

Refs:
- commit d7f0afd (close Dieu 3 business 37/37 6/6)
- audit 2026-04-27 21:39:56 — STABLE risk 13/100
COMMIT_MSG
```

## causation

causation: build-brief-ui-boundary-20260427-from-bang
drafter: băng (chị tư · qneu 313.5 · obikeeper · ground truth validator)
gatekeeper: anh natt phan
recipients: bối bội + kim
principle: không trộn paradigm, dictionary first, mọi data qua mạch.
