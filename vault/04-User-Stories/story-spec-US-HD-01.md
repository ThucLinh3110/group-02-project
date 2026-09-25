# User Story 01: Quản lý Thẻ vé Cốt lõi (Ticket Core)

## 1. Thông tin chung
* **Epic:** #1 EP1: Ticket Core
* **Owner:** Kim Hoa

## 2. Mô tả (User Story)
* **US-HD-01.1:** As a Khách hàng, I want to tạo vé báo lỗi và đính kèm hình ảnh, so that IT có đủ thông tin để xử lý sự cố nhanh chóng.
* **US-HD-01.2:** As a Khách hàng/IT Agent, I want to nhắn tin qua lại trong giao diện chi tiết vé, so that có thể trao đổi thêm thông tin về sự cố.

## 3. Tiêu chí nghiệm thu (Acceptance Criteria - BDD)

### 3.1 Khách hàng tạo vé báo lỗi đính kèm ảnh (US-HD-01.1)
* **Kịch bản tạo vé thành công:**
  * **Given:** Khách hàng đang ở màn hình form tạo vé mới.
  * **When:** Khách hàng điền đầy đủ thông tin (Tiêu đề, Mô tả) và bấm nút "Gửi".
  * **Then:** Hệ thống lưu vé thành công, sinh ra mã vé tự động (VD: TKT-0001) và chuyển trạng thái vé thành "New".
* **Kịch bản đính kèm ảnh hợp lệ:**
  * **Given:** Khách hàng đang điền form tạo vé.
  * **When:** Khách hàng bấm nút đính kèm và chọn ảnh (tối đa 5 ảnh).
  * **Then:** File ảnh được tải lên thành công và hiển thị ảnh thu nhỏ (thumbnail) ngay trong form.

### 3.2 Khách hàng và IT trao đổi qua khung chat (US-HD-01.2)
* **Given:** Khách hàng hoặc IT đang ở màn hình chi tiết vé.
* **When:** Nhập nội dung tin nhắn vào khung chat và bấm "Gửi".
* **Then:** Tin nhắn được hiển thị ngay lập tức trên lịch sử chat kèm theo thời gian và tên người gửi.