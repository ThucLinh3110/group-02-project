# Kịch bản Kiểm thử E2E (E2E Scenarios)

Tài liệu này định nghĩa các kịch bản kiểm thử End-to-End (E2E) quan trọng nhất của hệ thống AI Helpdesk IT Ticket Management, được viết dưới dạng **BDD (Behavior-Driven Development) / Cho trước-Khi-Thì (Given-When-Then)** để dễ dàng chuyển đổi thành code automation (Playwright/Cypress).

---

## Kịch bản 1: Khách hàng và IT hoàn thành luồng xử lý vé với AI hỗ trợ (Luồng Suôn sẻ - Happy Path)

**Cho trước (Given)** khách hàng (nv01) đã đăng nhập vào hệ thống  
**Và** Knowledge Base (Cơ sở tri thức) có chứa bài viết về "Lỗi màn hình xanh"  
**Khi (When)** khách hàng tạo một vé mới với mô tả "máy tính tự khởi động lại rồi hiện màn hình xanh"  
**Thì (Then)** hệ thống tạo thành công một vé mới với trạng thái "Mới" (New)  
**Và** AI Triage (AI Phân loại) chạy ngầm và phân loại vé vào danh mục "Phần cứng" (Hardware) với độ ưu tiên "Khẩn cấp" (Urgent)  
**Và** Backend tự động cài đặt hạn chót xử lý (SLA due date) là 4 giờ kể từ lúc tạo  
**Khi** IT Agent (admin) đăng nhập và xem chi tiết vé  
**Và** IT Agent bấm nút "Nhờ AI Gợi Ý"  
**Thì** ứng dụng hiển thị một câu trả lời nháp được AI sinh ra dựa trên bài viết trong Knowledge Base  
**Khi** IT Agent gửi câu trả lời và bấm "Đánh dấu đã giải quyết" (Resolve)  
**Thì** trạng thái của vé chuyển sang "Đã giải quyết" (Resolved)  
**Và** giao diện của khách hàng hiển thị nút "Nghiệm thu & Đóng vé"  
**Khi** khách hàng bấm "Nghiệm thu & Đóng vé"  
**Thì** trạng thái của vé chuyển sang "Đã đóng" (Closed)  
**Và** lịch sử lưu trữ của hệ thống ghi nhận chính xác các thay đổi trạng thái này.

---

## Kịch bản 2: Hệ thống tự động xử lý chuyển đổi khi AI gặp sự cố (Luồng Thất bại / Edge Case)

**Cho trước (Given)** khách hàng (nv01) đã đăng nhập vào hệ thống  
**Và** API key của Gemini AI bị sai hoặc mạng bị lỗi (gây ra quá hạn Timeout > 5s)  
**Khi (When)** khách hàng tạo một vé mới với mô tả "mạng wifi tầng 3 bị đứt"  
**Thì (Then)** hệ thống vẫn tạo vé thành công mà không làm sập ứng dụng web  
**Và** AI Triage chạy ngầm gặp lỗi kết nối/timeout  
**Thì** hệ thống tự động gán danh mục "Chưa rõ" (Unknown) và độ ưu tiên "Chưa phân công" (Unassigned)  
**Và** hệ thống gắn cờ vé là `needs_manual_review = true` (cần đánh giá thủ công)  
**Và** hệ thống tự động chèn một Tin nhắn Hệ thống: *"AI đang bận hoặc gặp sự cố, chuyển sang phân công thủ công."*  
**Khi** IT Manager đăng nhập  
**Thì** quản lý thấy cảnh báo đỏ trên vé  
**Và** quản lý có thể cập nhật thủ công các thẻ (Danh mục/Độ ưu tiên) trên giao diện để tiếp tục xử lý vé vượt qua sự cố của AI.

---

## Kịch bản 3: Backend ngăn chặn khách hàng vượt quyền (Bảo mật / Security Enforcements)

**Cho trước (Given)** khách hàng (nv01) đã đăng nhập vào hệ thống  
**Và** vé TKT-1001 đã được AI phân loại với độ ưu tiên "Thấp" (Low)  
**Khi (When)** khách hàng cố tình dùng các công cụ bên ngoài (như Postman) gửi yêu cầu PATCH thẳng vào API `/api/tickets/1001` với dữ liệu `{"priority": "Urgent"}`  
**Thì (Then)** backend lập tức trả về lỗi `403 Forbidden` (Cấm truy cập)  
**Và** độ ưu tiên của vé vẫn giữ nguyên là "Thấp"  
**Khi** khách hàng cố tình gọi thẳng API POST `/api/tickets/1001/resolve` (Tự đánh dấu giải quyết)  
**Thì** backend trả về lỗi `401 Unauthorized` hoặc `403 Forbidden`  
**Và** trạng thái vé không bị thay đổi.
