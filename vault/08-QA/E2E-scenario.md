# Kịch bản Kiểm thử E2E (E2E Scenarios)

Tài liệu này định nghĩa 5 kịch bản kiểm thử End-to-End (E2E) bao quát toàn bộ hệ thống AI Helpdesk IT Ticket Management, được viết dưới dạng **BDD (Behavior-Driven Development) / Given-When-Then** để dễ dàng chuyển đổi thành code automation (Playwright/Cypress).

---

## Kịch bản 1: Khách hàng và IT hoàn thành luồng xử lý vé với AI hỗ trợ (Luồng Suôn sẻ - Happy Path)

**Given** khách hàng (nv01) đã đăng nhập vào hệ thống  
**And** Knowledge Base (Cơ sở tri thức) có chứa bài viết về "Lỗi màn hình xanh"  
**When** khách hàng tạo một vé mới với mô tả "máy tính tự khởi động lại rồi hiện màn hình xanh"  
**Then** hệ thống tạo thành công một vé mới với trạng thái "Mới" (New)  
**And** AI Triage (AI Phân loại) chạy ngầm và phân loại vé vào danh mục "Phần cứng" (Hardware) với độ ưu tiên "Khẩn cấp" (Urgent)  
**And** Backend tự động cài đặt hạn chót xử lý (SLA due date) là 4 giờ kể từ lúc tạo  
**When** IT Agent (admin) đăng nhập và xem chi tiết vé  
**And** IT Agent bấm nút "Nhờ AI Gợi Ý"  
**Then** ứng dụng hiển thị một câu trả lời nháp được AI sinh ra dựa trên bài viết trong Knowledge Base  
**When** IT Agent gửi câu trả lời và bấm "Đánh dấu đã giải quyết" (Resolve)  
**Then** trạng thái của vé chuyển sang "Đã giải quyết" (Resolved)  
**And** giao diện của khách hàng hiển thị nút "Nghiệm thu & Đóng vé"  
**When** khách hàng bấm "Nghiệm thu & Đóng vé"  
**Then** trạng thái của vé chuyển sang "Đã đóng" (Closed)  
**And** lịch sử lưu trữ của hệ thống ghi nhận chính xác các thay đổi trạng thái này.

---

## Kịch bản 2: Hệ thống tự động xử lý chuyển đổi khi AI gặp sự cố (Luồng Thất bại / Edge Case)

**Given** khách hàng (nv01) đã đăng nhập vào hệ thống  
**And** API key của Gemini AI bị sai hoặc mạng bị lỗi (gây ra quá hạn Timeout > 5s)  
**When** khách hàng tạo một vé mới với mô tả "mạng wifi tầng 3 bị đứt"  
**Then** hệ thống vẫn tạo vé thành công mà không làm sập ứng dụng web  
**And** AI Triage chạy ngầm gặp lỗi kết nối/timeout  
**Then** hệ thống tự động gán danh mục "Chưa rõ" (Unknown) và độ ưu tiên "Chưa phân công" (Unassigned)  
**And** hệ thống gắn cờ vé là `needs_manual_review = true` (cần đánh giá thủ công)  
**And** hệ thống tự động chèn một Tin nhắn Hệ thống: *"AI đang bận hoặc gặp sự cố, chuyển sang phân công thủ công."*  
**When** IT Manager đăng nhập  
**Then** quản lý thấy cảnh báo đỏ trên vé  
**And** quản lý có thể cập nhật thủ công các thẻ (Danh mục/Độ ưu tiên) trên giao diện để tiếp tục xử lý vé vượt qua sự cố của AI.

---

## Kịch bản 3: Backend ngăn chặn khách hàng vượt quyền (Bảo mật / Security Enforcements)

**Given** khách hàng (nv01) đã đăng nhập vào hệ thống  
**And** vé TKT-1001 đã được AI phân loại với độ ưu tiên "Thấp" (Low)  
**When** khách hàng cố tình dùng các công cụ bên ngoài (như Postman) gửi yêu cầu PATCH thẳng vào API `/api/tickets/1001` với dữ liệu `{"priority": "Urgent"}`  
**Then** backend lập tức trả về lỗi `403 Forbidden` (Cấm truy cập)  
**And** độ ưu tiên của vé vẫn giữ nguyên là "Thấp"  
**When** khách hàng cố tình gọi thẳng API POST `/api/tickets/1001/resolve` (Tự đánh dấu giải quyết)  
**Then** backend trả về lỗi `401 Unauthorized` hoặc `403 Forbidden`  
**And** trạng thái vé không bị thay đổi.

---

## Kịch bản 4: IT Agent quản lý Knowledge Base và AI học lại (KB Upload)
**Given** IT Agent đăng nhập và truy cập trang Quản trị Tri thức (Knowledge Base)  
**When** Agent tải lên (upload) một file tài liệu `.txt` có tên "Khac_phuc_loi_VPN.txt" chứa nội dung "Khởi động lại Cisco AnyConnect"  
**Then** hệ thống trích xuất nội dung file và lưu bài viết thành công vào Database  
**When** một khách hàng tạo vé mới với mô tả "Không thể kết nối mạng công ty qua VPN"  
**And** IT Agent vào vé bấm "Nhờ AI Gợi Ý"  
**Then** AI lập tức đọc được tài liệu vừa upload và gợi ý: *"Vui lòng thử khởi động lại Cisco AnyConnect..."*

---

## Kịch bản 5: Cảnh báo quá hạn và đếm ngược thời gian (SLA Monitor)
**Given** một vé được tạo vào thứ Hai lúc 8:00 AM  
**And** AI phân loại độ ưu tiên là "Cao" (High - Hạn xử lý 24 giờ) -> Hạn chót là thứ Ba 8:00 AM  
**When** thời gian hệ thống là thứ Hai 4:00 PM (Trôi qua 8 tiếng, chưa tới hạn)  
**Then** SLA Badge hiển thị màu xanh lá cây "On Track"  
**When** thời gian trôi đến thứ Ba 7:00 AM (Còn lại < 20% thời gian)  
**Then** SLA Badge chuyển sang màu vàng "At Risk" (Nguy cơ trễ)  
**When** thời gian trôi qua thứ Ba 8:01 AM (Quá hạn)  
**Then** SLA Badge đổi sang màu đỏ "SLA Breached" trên cả trang chi tiết và Dashboard của Manager.
