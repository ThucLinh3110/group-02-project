# Test Strategy (Chiến lược Kiểm thử)

Tài liệu này mô tả chiến lược kiểm thử tổng thể, xác định rõ các cấp độ (Layer) sẽ test những gì và test như thế nào đối với Hệ thống AI-Assisted IT Helpdesk.

| Layer | Coverage cho case mẫu |
| :--- | :--- |
| **Unit** | Trích xuất và parse JSON (AI Triage output); Thuật toán SLA calculator (hàm tính mốc 4h, 24h, 3 ngày); Dependency xác thực quyền (`get_current_user`, `get_current_agent`); Password hasher. |
| **Integration** | Luồng tạo vé đính kèm ảnh -> Gọi AI Triage chạy ngầm (Background Task); Tương tác CRUD với Knowledge Base; Truy vấn SLA Metrics cho Dashboard; RBAC bảo vệ các API `/close`, `/resolve` khỏi tài khoản sai Role. |
| **E2E** | **Luồng Happy:** Login Customer → Tạo ticket "máy cháy" → Verify giao diện ticket báo Urgent/SLA đỏ → Login Agent → Nhận ticket → Nhờ AI Suggest sinh câu trả lời từ KB → Resolve ticket → Customer vào Close vé.<br><br>**Luồng Edge/Fallback:** Cố tình nhập sai AI API Key → Customer tạo vé mới → Verify hệ thống không sập, vé nhảy về Unassigned kèm System Message báo "AI đang bận". |
| **Non-functional** | **Performance:** Phản hồi của AI Triage Fallback phải xử lý dưới ngưỡng Timeout (5s).<br>**Security:** Không lộ `GEMINI_API_KEY` hay JWT Secret trên Github (Kiểm tra .env); Không lưu JWT token lỏng lẻo dễ bị đánh cắp XSS.<br>**UX:** Layout không bị vỡ trên khung hình mobile/tablet. |
