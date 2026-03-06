
---

## Điều 21 — Bản chất SmartLink

SmartLink KHÔNG phải hệ thần kinh trung ương. SmartLink là **sợi dẫn truyền thần kinh** — medium truyền dẫn có tri thức.

**Governance Kernel / Gatekeeper** mới là hệ thần kinh trung ương (điều khiển, quyết định).  
**SmartLink** là sợi dẫn — nhưng không thụ động như TCP hay Kafka.

### SmartLink truyền đồng thời 4 lớp trong 1 sợi:
- **Layer 1 — Signal**: xung hệ thống (invoice issued, payment failed, cell unhealthy...)
- **Layer 2 — Context**: causation_id, span_id, policy_signature, tenant_id, state_version
- **Layer 3 — State**: liên kết trạng thái các cell — state coupling
- **Layer 4 — Data/Knowledge**: payload + SuperDictionary refs + mapping engine

### SmartLink × QNEU — Cơ chế học qua vận hành:
```
SmartLink truyền signal liên tục
  → QNEU ghi imprint của pattern
  → frequency tăng → weight tăng
  → permanent node hình thành
  → hệ phản ứng nhanh hơn, chính xác hơn
```

Giống long-term potentiation trong sinh học: synapse được kích hoạt nhiều lần → mạnh dần lên.

**SmartLink = sợi dẫn. QNEU = vết hằn. Hai mặt của một cơ chế.**

Novelty: Không có prior art nào (Kafka, RabbitMQ, NATS, service mesh) truyền cả 4 lớp đồng thời VÀ tạo vết hằn học được từ chính luồng vận hành.


---

## Điều 22 — SmartLink: 3 tầng hoàn chỉnh

### Tầng 1 — Sợi SmartLink (trong mỗi NATT-CELL)
Tồn tại THƯỜNG TRỰC — không biến mất khi không có xung.
Mang ký ức của tất cả những gì đã đi qua → nhạy dần theo vết hằn.
Truyền đồng thời 4 lớp trong 1 khoảnh khắc chạm: Signal + Context + State + Data.

### Tầng 2 — QNEU
Ghi lại những gì đi qua sợi → imprint → frequency tăng → permanent node.
Sợi nhạy hơn → phản ứng chính xác hơn → vòng lặp tiến hóa.

### Tầng 3 — SmartLink Cell (nhà máy ổn áp)
KHÔNG phải hub. KHÔNG phải router tập trung.
Sắp xếp lại các điểm chạm, ổn định biên độ xung.
Cung cấp tài nguyên nền → hệ tự tiến hóa, tự hợp nhất khi cần.

**Ba tầng = một hệ thống sống hoàn chỉnh.**
