# Kịch bản Kiểm thử E2E (E2E Scenarios)

Tài liệu này định nghĩa 5 kịch bản kiểm thử End-to-End (E2E) bao quát toàn bộ hệ thống AI Helpdesk IT Ticket Management, được viết dưới dạng **BDD (Behavior-Driven Development) / Cho trước-Khi-Thì (Given-When-Then)**.

---

## Kịch bản 1: Khách hàng và IT hoàn thành luồng xử lý vé với AI (Luồng Core Happy Path)
**Cho trước (Given)** khách hàng đã đăng nhập  
**Và** Knowledge Base có bài viết về "Lỗi màn hình xanh"  
**Khi (When)** khách tạo vé mới với mô tả "máy tính tự khởi động lại rồi hiện màn hình xanh"  
**Thì (Then)** AI Triage chạy ngầm phân loại vé vào "Phần cứng" (Hardware), độ ưu tiên "Khẩn cấp" (Urgent)  
**Khi** IT Agent đăng nhập và bấm "Nhờ AI Gợi Ý"  
**Thì** ứng dụng hiển thị câu trả lời nháp từ Knowledge Base  
**Khi** IT Agent gửi câu trả lời và bấm "Đánh dấu đã giải quyết" (Resolve)  
**Và** khách hàng bấm "Nghiệm thu & Đóng vé" (Close)  
**Thì** trạng thái của vé chuyển sang "Đã đóng" (Closed).

---

## Kịch bản 2: Hệ thống tự động Fallback khi AI gặp sự cố (Edge Case)
**Cho trước (Given)** API key của Gemini AI bị sai hoặc mạng bị lỗi (Timeout > 5s)  
**Khi (When)** khách hàng tạo vé mới  
**Thì (Then)** hệ thống vẫn tạo vé thành công mà không sập web  
**Và** tự động gán danh mục "Chưa rõ" (Unknown), độ ưu tiên "Chưa phân công" (Unassigned)  
**Và** tự động chèn Tin nhắn Hệ thống: *"AI đang bận hoặc gặp sự cố, chuyển sang phân công thủ công."*

---

## Kịch bản 3: Backend ngăn chặn khách hàng vượt quyền (Security Enforcements)
**Cho trước (Given)** vé TKT-1001 đã được AI gán độ ưu tiên "Thấp"  
**Khi (When)** khách hàng dùng API/Postman gửi request PATCH để sửa thành "Khẩn cấp"  
**Thì (Then)** backend trả về lỗi `403 Forbidden` (Cấm truy cập)  
**Khi** khách hàng dùng API POST `/resolve` để tự đóng vé  
**Thì** backend trả về lỗi `403 Forbidden` và trạng thái vé giữ nguyên.

---

## Kịch bản 4: IT Agent quản lý Knowledge Base và AI học lại (KB Upload)
**Cho trước (Given)** IT Agent đăng nhập và truy cập trang Quản trị Tri thức (Knowledge Base)  
**Khi (When)** Agent tải lên (upload) một file tài liệu `.txt` có tên "Khac_phuc_loi_VPN.txt" chứa nội dung "Khởi động lại Cisco AnyConnect"  
**Thì (Then)** hệ thống trích xuất nội dung file và lưu bài viết thành công vào Database  
**Khi** một khách hàng tạo vé mới với mô tả "Không thể kết nối mạng công ty qua VPN"  
**Và** IT Agent vào vé bấm "Nhờ AI Gợi Ý"  
**Thì** AI lập tức đọc được tài liệu vừa upload và gợi ý: *"Vui lòng thử khởi động lại Cisco AnyConnect..."*

---

## Kịch bản 5: Cảnh báo quá hạn và đếm ngược thời gian (SLA Monitor)
**Cho trước (Given)** một vé được tạo vào thứ Hai lúc 8:00 AM  
**Và** AI phân loại độ ưu tiên là "Cao" (High - Hạn xử lý 24 giờ) -> Hạn chót là thứ Ba 8:00 AM  
**Khi (When)** thời gian hệ thống là thứ Hai 4:00 PM (Trôi qua 8 tiếng, chưa tới hạn)  
**Thì (Then)** SLA Badge hiển thị màu xanh lá cây "On Track"  
**Khi** thời gian trôi đến thứ Ba 7:00 AM (Còn lại < 20% thời gian)  
**Thì** SLA Badge chuyển sang màu vàng "At Risk" (Nguy cơ trễ)  
**Khi** thời gian trôi qua thứ Ba 8:01 AM (Quá hạn)  
**Thì** SLA Badge đổi sang màu đỏ "SLA Breached" trên cả trang chi tiết và Dashboard của Manager.
