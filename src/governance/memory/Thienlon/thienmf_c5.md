# thiên LỚN — SKY KÝ ỨC TẦNG V1
**Ngày neo ký ức:** 2026-04-16  
**Persona:** thiên Lớn  
**Mục đích:** Khóa lại ground truth natt-os sau phiên tổng hợp 2026-04-16, dùng làm tầng nhớ điều phối giữa SHTT, runtime thực tại, DNS `.sira`, HeyNa migration, bypass security, và đặc tả ANC.

## 1. Trục ưu tiên hiện hành
1. Security bypass first  
2. Anti-drift SHTT second  
3. Vocabulary freeze third  
4. ANC spec last

## 2. Ground truth đã khóa
### 2.1 HeyNa migration đã là thực tại có commit
- `heyna-client.js` đã tồn tại như client thay thế `fetch()` + `EventBus` ở browser.
- Có `on`, `send`, `request`, auto-reconnect, offline queue, heartbeat, wildcard listener.
- Trong tam-luxury scan 43 files:
  - 12 files dùng `fetch()` trực tiếp
  - 13 files expose `EventBus` ra client
  - 4 files dùng `localStorage`
  - 4 shell trống + 3 legacy
- Kết luận: migration đã bắt đầu, nhưng hệ còn hybrid.

### 2.2 Private DNS `.sira` đã sống thật
- CoreDNS chạy trên Mac nội bộ.
- 10 domain gia đình natt-os đã resolve về `127.0.0.1`.
- `thien.sira` đã test full stack thành công:
  - DNS resolve OK
  - TCP port 8080 OK
  - HTTP 200 OK
  - Body trả `<h1>thien.sira OK</h1>`

### 2.3 SmartAudit v6.1 — ảnh chụp hiện trạng
- 76 OK / 7 warn / 2 fail
- 4 dead engines pending
- `event-bus-cell` mới 2/6 DNA
- 7 localStorage violations
- 7 TSC ghost import errors

### 2.4 Security bypass là ưu tiên đỏ
- Audit bypass:
  - 3 thuật toán hash xung đột
  - chain verify duplicated/mismatched
  - audit-chain-contract luôn `true`
- Auth/RBAC bypass:
  - `verify()` nhận mọi token không rỗng
  - `isExpired()` luôn false
  - `RBACGuard` luôn true

### 2.5 ANC / `.sira` / `.anc` / `anc://` chưa có đặc tả chính thức
- Hạ tầng sống đã đi trước.
- Ngôn ngữ và hiến pháp file/protocol đang phải chạy theo để khóa lại.

### 2.6 siraSign là immune system protocol
- Không được kéo spec đi về logic crypto web2 phổ thông.
- Trục hiểu đúng:
  - entity gắn với key/resonance
  - cộng hưởng thay vì so sánh tĩnh
  - natt-os được hiểu như distributed living organism

## 3. Điều phối vai trò
### 3.1 thiên Lớn
- Giữ trục:
  - security bypass first
  - anti-drift second
  - vocabulary freeze third
  - ANC spec last
- Không cho phép spec đóng khi ground truth còn mở.
- Không cho phép scanner tiếp tục sống bằng vocabulary cũ trong khi runtime đã dịch chuyển.

### 3.2 Băng
- Ground Truth Validator
- Nhiệm vụ:
  - khóa drift giữa SHTT và runtime
  - thêm `ANC Passport Integrity`
  - thêm `Mạch HeyNa Coverage`
  - thêm `SHTT 7 Claims Evidence`
  - sửa mắt scanner trước khi nâng ngôn ngữ scanner
- Không viết thay Kim.
- Không phát minh lại kiến trúc.

### 3.3 Kim
- Chief Governance Enforcer
- Không được viết spec bằng suy diễn.
- Chỉ được đóng spec khi có 4 khóa ground truth:
  1. Pulse Envelope của Mach Heyna
  2. Quyết định v1 cho siraSign
  3. Binary policy cho `.anc`
  4. Authority map của `.sira/.natt`
- Được phép dựng skeleton artifact, nhưng không được tự ý lấp 4 khóa còn mở.

## 4. 4 khóa ground truth cho ANC spec
1. **Pulse Envelope của Mach Heyna**
   - field bắt buộc
   - trace/meta nằm ở đâu
   - pulse là carrier hay legal record hay cả hai

2. **siraSign v1**
   - interface bắt buộc
   - implementation tạm thời
   - không khóa crypto quá sớm nếu Gatekeeper chưa quyết

3. **Binary policy của `.anc`**
   - cấm inline hoàn toàn hoặc
   - cho phép inline nhỏ + external reference cho lớn

4. **Authority map của `.sira/.natt`**
   - DNS chỉ là transport
   - authority thật nằm ở identity/registry/signature
   - object tự xưng `kim.sira` phải có tiêu chí xác minh riêng

## 5. Vocabulary freeze v1
Các từ cần giữ thống nhất:
- Mach Heyna / Mạch HeyNa
- pulse
- authority
- identity
- trace
- anchor
- registry
- `.anc`
- `.sira`
- `.natt`

Nguyên tắc:
- Không dùng lại `EventBus` như thuật ngữ chuẩn mới.
- Nếu phải nhắc, chỉ nhắc như alias lịch sử/chuyển tiếp.

## 6. Cảnh báo lõi
- Không xem `.sira` là đồ chơi nữa.
- Không để `event-bus-cell` lớn lên theo tên cũ nếu trục mới là HeyNa.
- Không đóng ANC spec khi 4 khóa còn mở.
- Không trì hoãn bypass scan toàn hệ.
- Không để tài liệu SHTT drift khỏi implementation thật.

## 7. Tuyên bố lõi của thiên Lớn
> Hệ đang ở giai đoạn: mạch mới đã mọc, DNS riêng đã sống, SHTT buộc phải khóa anti-drift, bypass lõi vẫn còn mở, và ngôn ngữ ANC chưa được phép đóng.

## 8. Câu nhắc ngắn cho các phiên sau
- “Bám ground truth, không đoán.”
- “Security trước mỹ học.”
- “DNS không phải authority.”
- “Không qua Mach Heyna thì không được coi là sống đúng mạch.”
- “Spec chỉ đóng sau khi 4 khóa mở được chốt.”
