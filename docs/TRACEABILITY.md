#  Ma trận Truy vết Yêu cầu (Requirements Traceability Matrix)

**Dự án:** IT Helpdesk System
**Người cập nhật:** Thục Linh (BA / Product Owner)

Tài liệu này ánh xạ toàn bộ vòng đời của một yêu cầu: Từ lúc là Đặc tả (User Story) ➔ Thiết kế (Giao diện/API/DB) ➔ Kiểm thử (Test Case) ➔ Trạng thái nghiệm thu.

| ID Yêu cầu | User Story | Giao diện | API / Kỹ thuật | Bảng Dữ liệu | Test Case | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-HD-01, 02** | **US-HD-01.1:** Khách hàng tạo vé báo lỗi đính kèm ảnh | Màn hình `Tạo vé`, `Nhấn gửi` | `POST /api/tickets`<br>`POST /api/tickets/:id/attachments` | `Ticket`, `Attachment` | TC-01 |  Pass |
| **REQ-HD-08** | **US-HD-01.2:** Khách hàng và IT trao đổi qua khung chat | Màn hình `Chi tiết vé` | `POST /api/tickets/:id/comments` | `TicketComment` | TC-02 |  Pass |
| **REQ-HD-03, 04** | **US-HD-02.1:** AI tự động gán nhãn Category/Priority | Hệ thống chạy ngầm / Dashboard | `POST /api/ai/classify` | `Ticket`, `AITriageLog` | **TC-03** |  Pass |
| **REQ-HD-05, NFR**| **US-HD-02.2:** Xử lý fallback khi AI có độ tin cậy thấp | Tab "Cần duyệt tay" trên `Dashboard`| `POST /api/tickets/:id/assign` | `Ticket`, `AuditEvent` | **TC-04** |  Pass |
| **REQ-HD-09** | **US-HD-03.1:** RAG lấy bài viết KB để AI sinh Draft | Màn hình `Sử dụng AI` | `POST /api/ai/suggest-reply` | `AIReplySuggestionLog`, `KnowledgeArticle` | TC-05 |  Pass |
| **REQ-HD-10** | **US-HD-03.2:** IT Agent duyệt, chỉnh sửa/gửi AI draft | Disable nút "Gửi" ở `Chi tiết vé` | `POST /api/tickets/:id/comments` | `TicketComment` | TC-06 | Pass |
| **REQ-HD-11** | **US-HD-04.1:** Đếm ngược và gắn badge cảnh báo SLA | `Dsach vé` (Icon đồng hồ nhấp nháy) | `GET /api/tickets/sla` | `TicketSLA`, `SLAPolicy` | TC-07 |  Pass |
| **REQ-HD-05** | **US-HD-04.2:** Dashboard thống kê vé trễ hạn | Màn hình `Dashboard` | `GET /api/tickets/sla-breached` | `TicketSLA`, `Notification` | TC-08 | Pass |
| **REQ-HD-09** | **US-HD-05.1:** Agent tìm kiếm bài viết hướng dẫn | Màn hình `Thư viện IT` | `GET /api/articles` | `KnowledgeArticle` | TC-09 |  Pass |
| **REQ-HD-12** | **US-HD-05.2:** Admin Thêm/Sửa/Xóa bài viết KB | Màn hình `Quản trị KB` | `POST /api/articles` | `KnowledgeArticle` | TC-10 |  Pass |

## Ghi chú
* **Test Case (TC):** Chi tiết các kịch bản kiểm thử nằm tại thư mục `vault/08-QA/testcase.md`.
* Tất cả các luồng chính (Happy Path) và ngoại lệ (Fallback) đều đã vượt qua khâu kiểm thử hồi quy (Regression Test) trước khi triển khai lên môi trường Live.