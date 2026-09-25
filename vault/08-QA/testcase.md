# Danh sách Test Cases (Test Matrix)

Tài liệu này lưu trữ danh sách các kịch bản kiểm thử (Test Cases) để đối chiếu (Trace) với các yêu cầu hệ thống của dự án AI Helpdesk IT Ticket Management. Bảng này bao phủ cả Frontend, Backend và tính năng AI.

| ID | Case (Kịch bản) | Trace (Tham chiếu) | Expected (Kết quả mong đợi) | Mode (Chế độ) |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Đăng nhập tài khoản hợp lệ | UC-01 | Trả về JWT token, chuyển hướng đúng role | Automated |
| **TC-02** | Đăng nhập sai mật khẩu | UC-01 | Trả về HTTP 401, hiển thị lỗi UI | Automated |
| **TC-03** | Khách tạo vé với mô tả ngắn | BR-HD-01 | Vé tạo thành công, AI Triage vẫn phân loại | Automated |
| **TC-04** | Khách tạo vé có đính kèm ảnh | UC-02 | File được lưu vào uploads, vé chứa URL ảnh | Automated |
| **TC-05** | Khách hàng cố sửa Priority của vé | BR-HD-03 | API trả về HTTP 403 Forbidden | Automated |
| **TC-06** | Khách hàng tự gọi API Resolve vé | BR-HD-02 | API trả về HTTP 403 (Chỉ Agent được quyền) | Automated |
| **TC-07** | AI Triage API gặp sự cố (Timeout) | Q-HD-01 | Gán Unknown, ghi System Message "AI đang bận" | Automated |
| **TC-08** | Agent bấm "Nhờ AI Gợi Ý" | UC-05 | Lấy dữ liệu từ KB, hiển thị câu trả lời nháp | Automated |
| **TC-09** | AI Suggest API gặp sự cố | Q-HD-01 | Hiển thị alert báo lỗi "Lỗi khi gọi AI" trên UI | Automated |
| **TC-10** | Tải lên file .txt vào Knowledge Base | UC-10 | Hệ thống trích xuất chữ và tạo bài viết KB mới | Automated |
| **TC-11** | Agent xóa bài viết Knowledge Base | UC-10 | Bài viết bị xóa khỏi DB, biến mất khỏi UI | Automated |
| **TC-12** | Thuật toán tính toán SLA (Urgent) | SLA-01 | Ngày quá hạn = Ngày tạo + 4 giờ | Automated |
| **TC-13** | Khách hàng bấm Close vé | UC-08 | Vé chuyển sang Closed nếu đã được Resolve | Automated |
| **TC-14** | Trạng thái đồng hồ SLA (Real-time) | NFR-UI-01 | Chuyển On Track -> At Risk -> Overdue (màu) | Manual/E2E |
| **TC-15** | Giao diện trên thiết bị di động | NFR-UI-02 | Responsive không vỡ layout, menu rút gọn | Manual/E2E |
