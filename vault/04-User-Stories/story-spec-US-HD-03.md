#  User Story 03: AI Reply - Gợi ý câu trả lời

## 1. Thông tin chung
* **Epic:** #3 EP3: AI Reply
* **Owner:** Hoàng Luy

## 2. Mô tả (User Story)
* **US-HD-03.1:** As a IT Agent, I want hệ thống AI tự động đọc lỗi và gợi ý câu trả lời dựa trên kho dữ liệu (Knowledge Base), so that tôi có thể phản hồi khách hàng cực nhanh mà không cần gõ lại từ đầu.
* **US-HD-03.2:** As a IT Agent, I want có thể đọc lại và chỉnh sửa câu trả lời do AI viết trước khi gửi, so that tôi kiểm soát được độ chính xác và văn phong khi nhắn cho khách hàng.

## 3. Tiêu chí nghiệm thu (Acceptance Criteria - BDD)

### 3.1 AI gợi ý câu trả lời dựa trên Knowledge Base (US-HD-03.1)
* **Kịch bản AI gợi ý thành công:**
  * **Given:** Nhân viên IT đang xem chi tiết một vé lỗi (VD: "Không kết nối được máy in tầng 3").
  * **When:** Nhân viên bấm vào nút "Nhờ AI gợi ý".
  * **Then:** Hệ thống AI quét kho tài liệu và sinh ra một đoạn văn bản nháp (draft) hướng dẫn cách sửa lỗi hiển thị ngay trong khung chat.
* **Kịch bản không tìm thấy dữ liệu:**
  * **Given:** Lỗi khách hàng báo là lỗi mới, chưa từng có trong kho dữ liệu.
  * **When:** Nhân viên bấm nút "Nhờ AI gợi ý".
  * **Then:** AI trả lời "Không tìm thấy tài liệu liên quan, vui lòng phản hồi thủ công" và giữ trống khung chat.

### 3.2 IT Agent duyệt, chỉnh sửa và gửi phản hồi AI (US-HD-03.2)
* **Kịch bản duyệt và gửi thành công:**
  * **Given:** AI đã tạo xong một đoạn tin nhắn nháp trong khung chat.
  * **When:** Nhân viên IT đọc, gõ chỉnh sửa lại một vài chữ cho hợp lý rồi bấm nút "Gửi".
  * **Then:** Tin nhắn được gửi đến khách hàng và trạng thái của vé tự động chuyển sang "In Progress" (Đang xử lý).
* **Kịch bản hủy bỏ gợi ý:**
  * **Given:** AI tạo ra câu trả lời nháp nhưng bị sai kiến thức.
  * **When:** Nhân viên IT bấm nút "Xóa nháp".
  * **Then:** Khung chat bị làm trống hoàn toàn để nhân viên tự gõ câu trả lời thủ công.