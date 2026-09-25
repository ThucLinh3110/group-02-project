# 18.28. Output #28 - Bug Report (Critical Level)

## BUG-99 - Tạo duplicate (vé trùng lặp) khi click liên tục vào nút Gửi

**Summary:**
Trong luồng Tạo vé hỗ trợ (Create Ticket) và Thêm FAQ, nếu người dùng có mạng chậm và click đúp nhanh nhiều lần vào nút "Gửi", hệ thống sẽ tạo ra nhiều record giống hệt nhau trong Database.

**Environment:**
Chrome 128 / Windows 11 / Luồng Tạo Vé & Thêm FAQ.

**Reproduction:**
1. Đăng nhập hệ thống (tài khoản User hoặc Admin).
2. Điền đầy đủ thông tin vào Form Tạo vé (hoặc form thêm FAQ).
3. Sử dụng chuột click 3 lần liên tiếp thật nhanh (Spam click) vào nút "Xác nhận gửi".
4. Tải lại trang (F5) và kiểm tra danh sách.

**Expected:**
Hệ thống chỉ được phép tạo 1 vé duy nhất cho dù người dùng có bấm bao nhiêu lần. Nút "Gửi" phải bị vô hiệu hóa (Disabled) và hiện chữ "Đang xử lý..." ngay cú click đầu tiên.

**Actual:**
Hệ thống không khóa nút Gửi, dẫn đến việc Frontend bắn đi 3 API POST requests cùng lúc. Database ghi nhận 3 vé giống hệt nhau, gây rác dữ liệu.

**Root Cause:**
* Frontend: Chưa quản lý state `isLoading` khi đang đợi API trả kết quả.
* Backend: Chưa có cơ chế `Idempotency Key` (khóa chống trùng lặp) cho các thao tác thay đổi dữ liệu (POST).

**Solution (Yêu cầu Dev sửa ngay):**
1. **Frontend:** Gắn state `isSubmitting` vào nút bấm. Khi onClick -> set `true` -> thuộc tính nút đổi thành `disabled`. Chỉ mở lại khi nhận response (Thành công/Thất bại).
2. **Backend:** Validate thời gian tạo vé của cùng 1 user (ví dụ: không cho phép tạo 2 vé giống nhau trong vòng 2 giây).

**Regression Risk:** High
Ảnh hưởng trực tiếp đến logic kinh doanh cốt lõi (Ticket Management), gây phình to Database.

**Test Plan (Đã verify sau khi Dev sửa):**
- E2E Playwright: Chạy bot dùng lệnh `await page.locator('#btn-submit').dblclick()`. Xác nhận DB chỉ tăng `+1` record.
