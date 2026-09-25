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
