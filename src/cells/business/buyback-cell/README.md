# buyback-cell

## muc dich
xu ly nghiep vu **thu mua vang cu, đau tra, trade-in** — dac thu nganh trang suc.

## Flow chinh
1. **tiep nhan** — khach mang hang cu den
2. **kiem dinh** — do tuoi vang, trong luong, kiem da, danh gia tinh trang
3. **tinh gia** — cong thuc: `(weight × marketPrice × purity) + stone - depreciation - labor`
4. **Thanh toan** — tra tien cho khach hoac tinh bu Trade-in
5. **phan loai** — RESELL / REFURBISH / SCRAP_GOLD / SCRAP_STONE

## Boundary Rules
- ✅ Giao tiep qua `shared-contracts-cell` + EDA events
- ❌ khong import truc tiep tu business cells khac
- ❌ khong import kernel / infrastructure

## Events
### Emitted
- `buyback.transaction.created`
- `buyback.inspection.completed`
- `buyback.price.calculated`
- `buyback.payment.completed`
- `buyback.classified`
- `buyback.tradein.initiated`

### Consumed
- `pricing.gold.market.updated`
- `customer.verified`
- `inventory.item.received`
