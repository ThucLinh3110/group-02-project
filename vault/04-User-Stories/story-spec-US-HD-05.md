# 📖 User Story 05: Knowledge Base (Kho tài liệu hướng dẫn)

## 1. Thông tin chung
* **Epic:** #5 EP5: Knowledge Base
* **Owner:** Bảo Ngọc

## 2. Mô tả (User Story)
* **US-HD-05.1:** As an IT Agent, I want to tìm kiếm bài viết hướng dẫn trong Knowledge Base, so that tôi có thể tự giải quyết nhanh các thẻ vé sự cố dựa trên quy trình chuẩn của phòng IT.
* **US-HD-05.2:** As a IT Agent, I want to thêm, sửa, xóa bài viết trong Knowledge Base, so that thư viện tài liệu luôn được cập nhật và chính xác cho nhân viên tra cứu.

## 3. Tiêu chí nghiệm thu (Acceptance Criteria - BDD)

### 3.1 Agent tìm kiếm bài viết hướng dẫn (US-HD-05.1)
* **Kịch bản bảo mật luồng truy cập (RBAC):**
  * **Given:** Một Customer (Nhân viên các phòng ban khác) đăng nhập vào hệ thống.
  * **When:** Ở trang chủ Dashboard.
  * **Then:** Hệ thống ẩn hoàn toàn menu "Knowledge Base". Nếu cố tình gõ URL, hệ thống chặn lại và báo lỗi 403.
* **Kịch bản tìm kiếm có kết quả (Happy Path):**
  * **Given:** IT Agent nhập từ khóa vào ô tìm kiếm (VD: "cấu hình VPN").
  * **When:** Bấm Enter.
  * **Then:** Hệ thống hiển thị danh sách tài liệu hướng dẫn nội bộ khớp với từ khóa, cho phép IT đọc để làm theo.
* **Kịch bản tìm kiếm không có kết quả (Empty State):**
  * **Given:** IT Agent tìm kiếm một lỗi mới chưa từng được ghi nhận trong thư viện.
  * **When:** Bấm tìm kiếm.
  * **Then:** Hệ thống báo "Không tìm thấy kết quả".

### 3.2 Admin Thêm/Sửa/Xóa bài viết Knowledge Base (US-HD-05.2)
* **Kịch bản tạo bài viết thành công:**
  * **Given:** IT Agent đang ở màn hình Quản lý Knowledge Base.
  * **When:** Bấm nút "Upload" và chọn một file tài liệu .txt hợp lệ từ máy tính.
  * **Then:** Hệ thống tải file lên thành công, hiển thị file đó ngay trong danh sách tài liệu kèm theo ngày giờ tải lên.
* **Kịch bản xóa bài viết:**
  * **Given:** Admin đang xem 1 bài viết đã tồn tại trong danh sách quản lý.
  * **When:** Admin bấm nút "Xóa" và xác nhận trong hộp thoại cảnh báo.
  * **Then:** Bài viết bị xóa khỏi hệ thống, không còn hiển thị ở cả trang quản lý Knowledge Base.
* **Kịch bản chỉnh sửa tài liệu (Update):**
  * **Given:** IT Agent đang xem chi tiết một bài viết hướng dẫn trong Knowledge Base.
  * **When:** IT Agent bấm nút "Chỉnh sửa", thay đổi nội dung bài viết và bấm "Lưu".
  * **Then:** Hệ thống cập nhật tài liệu thành công, hiển thị phiên bản mới nhất kèm theo thời gian "Cập nhật lần cuối" (Last Updated) cho toàn bộ đội IT.