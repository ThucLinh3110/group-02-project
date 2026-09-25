# 18.26. Output #26 - Test Strategy (Master Plan)

| Layer | Coverage cho toàn dự án |
| :--- | :--- |
| Unit | Form validation (Login, Tạo vé, FAQ); JWT token format check |
| Integration | API Đăng nhập; API Tạo/Quản lý Vé; API CRUD Thư viện FAQ |
| E2E | Luồng End-to-End trọn vẹn: Đăng nhập -> Tìm kiếm FAQ -> Không thấy -> Tạo vé hỗ trợ -> Admin duyệt vé |
| Non-functional | Debounce search (400ms); Xử lý trạng thái Loading (tránh duplicate data); Phân quyền bảo mật (RBAC) |

### TEST CASES 

| ID | Case | Trace | Expected | Mode |
| :--- | :--- | :--- | :--- | :--- |
| TC-01 | Login tài khoản hợp lệ | US-AUTH-01 | Cấp JWT Token, chuyển hướng vào Dashboard | Automated |
| TC-02 | Login sai mật khẩu/email | US-AUTH-02 | Báo lỗi "Sai thông tin", không cho đăng nhập | Automated |
| TC-03 | User tạo vé hỗ trợ (Ticket) | US-TICKET-01 | Vé mới được tạo, trả về HTTP 201 Created | Automated |
| TC-04 | Test chống Spam tạo vé | US-TICKET-02 | Bấm đúp nút Gửi không bị tạo ra 2 vé trùng | Automated |
| TC-05 | Admin xem danh sách vé | US-ADMIN-01 | Chỉ Admin mới gọi được API lấy toàn bộ vé | Automated |
| TC-06 | Live Search FAQ (Từ khóa chuẩn) | US-FAQ-01 | Lưới (Grid) lọc ra bài viết FAQ tương ứng | Automated |
| TC-07 | Live Search FAQ (Từ khóa rác) | US-FAQ-02 | Báo "Không tìm thấy", gợi ý tạo vé mới | Automated |
| TC-08 | Tối ưu hiệu năng Debounce | NFR-FAQ-01 | Chỉ gửi API gọi Search sau khi ngừng gõ 400ms | Manual |
| TC-09 | Admin thêm bài FAQ mới | US-FAQ-03 | Form thêm thành công, DB lưu dữ liệu chuẩn | Automated |
| TC-10 | Bot Playwright chạy E2E | SYS-CI-01 | File `login-and-create-ticket.spec.ts` Pass xanh lá | Automated |
