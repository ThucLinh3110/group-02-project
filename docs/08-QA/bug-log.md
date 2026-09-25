## BUG-01 - Bỏ lọt xác thực (Authentication) tại API Tạo vé (Create Ticket)

**Severity:** High (Security)
**Status:** Closed / Fixed
**Owner:** Backend Team

**Summary:**
API `POST /api/tickets` (Create Ticket) đang ở trạng thái Public, cho phép bất kỳ ai (kể cả khách vãng lai không có token đăng nhập) gửi request tạo vé lên hệ thống làm rác Database.

**Environment:**
Backend FastAPI / Endpoint `/api/tickets`.

**Reproduction:**
1. Chạy server backend cục bộ.
2. Dùng công cụ gọi API (curl, Postman, hoặc TestClient).
3. Gửi request POST đến `/api/tickets` với form data `title="Lỗi"`, `description="Lỗi"`.
4. Cố tình KHÔNG truyền header `Authorization: Bearer <token>`.
5. Quan sát mã trạng thái phản hồi.

**Expected:**
Hệ thống phải từ chối truy cập và trả về mã lỗi `HTTP 401 Unauthorized` do thiếu xác thực. (Ánh xạ Test case `TC-034`).

**Actual:**
API vẫn xử lý thành công, trả về mã `HTTP 200 OK` cùng dữ liệu vé vừa được chèn thẳng vào Database.

**Root Cause:**
Trong function `create_ticket` (nằm ở file `src/backend/routers/tickets.py`), lập trình viên đã quên khai báo dependency bảo mật `get_current_user`. Dẫn đến việc FastAPI coi endpoint này là route mở (không cần xác thực).

**Solution:**
Bổ sung dependency `current_user = Depends(get_current_user)` vào tham số của hàm `create_ticket` để ép Middleware của FastAPI chặn đứng mọi request không có Token.

**Regression Risk:** Low
Sửa đổi chỉ đóng vai trò chốt chặn bảo mật (Security Gate) tại tầng Router của riêng API tạo vé, không làm thay đổi hay vỡ cấu trúc Payload/Database bên dưới.

**Test Plan (Regression Test):**
- **Integration/API (Pytest):** 
  - Đã mở và cập nhật lại test case tự động `test_create_ticket_without_auth` (TC-034).
  - Hành động: Bắn request tạo vé mà không đính kèm Token.
  - Assert: Kiểm tra chặt `response.status_code == 401`.
  - **Evidence:** Test case đã chạy lại bằng `uv run pytest` và báo **PASSED** (đã tái hiện được bug và chứng minh bug đã được Fix hoàn toàn).

---

## BUG-02 - Sai logic hiển thị khung Chat UI (Sender/Receiver Alignment)

**Severity:** Medium (UX/UI)
**Status:** Closed / Fixed
**Owner:** Frontend Team

**Summary:**
Khi mở giao diện chi tiết vé (`TicketDetail`), toàn bộ tin nhắn do IT Agent gửi luôn bị ép lề phải (như là tin nhắn của chính mình), kể cả khi người đang xem là Customer. Điều này gây bối rối nghiêm trọng về mặt UX, Customer sẽ tưởng IT Agent là chính họ.

**Environment:**
Frontend React / Component `TicketDetail.tsx`.

**Reproduction:**
1. Đăng nhập với tài khoản Customer.
2. Mở một ticket đã có tin nhắn phản hồi từ IT Agent.
3. Quan sát khung chat.

**Expected:**
Tin nhắn của *người đang đăng nhập (Current User)* phải nằm bên phải. Tin nhắn của *người khác* phải nằm bên trái. (Ví dụ Customer nhìn thấy tin nhắn của họ ở bên phải, tin của Agent ở bên trái).

**Actual:**
Biến `isAgent` trong vòng lặp `.map` bị shadow (đè) biến `isAgent` của component. Dẫn đến việc cứ tin nhắn có `role === AGENT` là tự động ném sang phải, bất chấp ai đang xem.

**Root Cause:**
Lỗi logic React:
```tsx
const isAgent = msg.role === MessageRole.AGENT; // Khai báo trùng tên biến
// ... className={isAgent ? 'ml-auto flex-row-reverse' : ''}
```

**Solution:**
Đổi tên biến và sửa lại biểu thức logic kiểm tra tính sở hữu tin nhắn (`isMine`):
```tsx
const isMsgFromAgent = msg.role === MessageRole.AGENT;
const isMine = (isAgent && isMsgFromAgent) || (!isAgent && !isMsgFromAgent);
// ... className={isMine ? 'ml-auto flex-row-reverse' : ''}
```

**Regression Risk:** Low
Chỉ thay đổi logic CSS rendering lớp UI của riêng khung Chat.

**Test Plan (Regression Test):**
- **Manual UI Test:** Đăng nhập lại bằng Customer, mở Chat -> Tin của Customer nằm bên phải, IT Agent nằm bên trái. Đăng nhập lại bằng Agent -> Đảo ngược lại. Mọi thứ hoạt động hoàn hảo. Cập nhật mã nguồn trên nhánh `main`.

---

## BUG-03 - Tab "All Active" ẩn mất Ticket đã hoàn thành (Done)

**Severity:** Low (UX)
**Status:** Closed / Fixed
**Owner:** Frontend Team

**Summary:**
Khách hàng thắc mắc tại sao khi click vào tab "All Active" (Tất cả) trên Dashboard thì lại không thấy các Ticket ở trạng thái `Closed` hoặc `Resolved` đâu cả, gây lầm tưởng bị mất dữ liệu.

**Environment:**
Frontend React / Component `Dashboard.tsx`.

**Reproduction:**
1. Mở trang Dashboard.
2. Nhìn vào thẻ thông kê góc trái (Tab "All Active").
3. Nhấp vào tab này, bảng bên dưới không hiện các vé đã Done.

**Expected:**
Khách hàng coi nút đầu tiên là thẻ "Tổng hợp" (All Tickets), nên kỳ vọng bảng sẽ liệt kê toàn bộ vé bất chấp trạng thái.

**Actual:**
Logic filter cho tab `all` đang gạt bỏ các vé Done: `if (filter === 'all') return t.status !== 'Closed' && t.status !== 'Resolved';`

**Root Cause:**
Hiểu lầm về mặt nghiệp vụ UX giữa "Tất cả vé" và "Tất cả vé đang xử lý".

**Solution:**
Đổi tên hiển thị từ `Total Active` thành `All Tickets`. Sửa logic filter:
`if (filter === 'all') return true;`

**Regression Risk:** Low

**Test Plan (Regression Test):**
- **Manual UI Test:** Mở màn hình Dashboard, click vào ô "All Tickets", bảng bên dưới đã hiển thị cả những vé Resolved/Closed. Fix thành công.
