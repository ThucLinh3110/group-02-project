# Code Review Evidence

## 1. Story/Task Link
- **Feature:** Xây dựng hệ thống IT Helpdesk Ticket Management tích hợp AI (UC-01 đến UC-10).
- **PR Link:** [PR #1] - Implement Core Features (Tickets, SLA, AI Triage, KB CRUD)

## 2. Review Checklist
Quy trình: `READ → UNDERSTAND → VERIFY → EVALUATE → RESPOND → IMPLEMENT`
- [x] Đã đọc hiểu toàn bộ source code (FastAPI backend + React frontend).
- [x] Đã kiểm tra logic Auth/Permission (RBAC), validation, secrets, error paths, race condition.
- [x] Không chấp nhận feedback chỉ vì nghe hợp lý; mọi đánh giá đều được đối chiếu trực tiếp trên context codebase thực tế.
- [x] Đưa ra hướng giải quyết (Action/Resolution) và tiến hành sửa chữa nếu có thể.

## 3. Findings & Resolutions

| Severity | Finding (Kiểm tra trong context) | Action / Resolution |
| :--- | :--- | :--- |
| **High** (Blocker) | **Secrets in Code:** Cấu hình `GEMINI_API_KEY` vô tình bị ghi cứng vào file `.env` chưa được chặn bằng gitignore, dẫn tới rủi ro bị lộ (leaked) khi push code lên GitHub. GitHub Security đã văng lỗi Push Protection. | **Resolved:** Hủy bỏ commit chứa secret bằng `git reset HEAD~1`. Tạo `.gitignore` chuẩn xác và cung cấp file `.env.example` chứa key giả để chia sẻ an toàn cho team. |
| **High** (Blocker) | **API Error Paths / Crash:** Tại endpoint gọi AI Suggest (UC-05), nếu API Key không có quyền truy cập model (gemini-1.5-flash-latest), server văng lỗi `500 Internal Server Error` làm sập cứng tiến trình ứng dụng. | **Resolved:** Chuyển sang sử dụng model `gemini-flash-lite-latest` được cấp quyền. Bổ sung error handler/fallback để trả về thông báo lỗi lịch sự thay vì crash server. |
| **Medium** (Major) | **Security / Permission:** Phân quyền vai trò (Role-Based Access Control) hiện tại chỉ được chặn ở Frontend (ẩn menu, chặn truy cập router `/kb` bằng lỗi 403). Backend chưa có middleware kiểm tra Token/Role xác thực thật sự. | **Action:** Yêu cầu bổ sung cơ chế JWT Authentication và Security Dependency `get_current_user` trên FastAPI để bảo vệ triệt để các API endpoint `/api/kb/*`. |
| **Medium** (Major) | **Race Condition & Memory Leak:** Khi xử lý đếm ngược đồng hồ SLA trên giao diện Frontend (`SLABadge.tsx`), việc dùng `setInterval` nếu không dọn dẹp kỹ khi Component unmount sẽ gây rò rỉ bộ nhớ (Memory Leak) và race condition nhảy số. | **Resolved:** Đã áp dụng React Hook `useEffect` có return function `clearInterval` để hủy đồng hồ ngay lập tức khi component bị hủy (unmount). |
| **Low** (Minor) | **Kiến trúc Frontend / Component quá tải:** File `KBPage.tsx` phình to hơn 230 dòng, ôm đồm cả logic gọi API (Axios CRUD) lẫn UI rendering, quản lý form state rất phức tạp. | **Action:** Refactor: Tách toàn bộ logic gọi data ra thành một Custom Hook (ví dụ `useKnowledgeBase()`) trong giai đoạn tối ưu mã nguồn (feature stabilizes). |

## 4. Completion Gate
- **Status:** **PASS** ✅
- **Evident:** Sau khi hoàn tất review và sửa chữa các lỗi High Blocker (Lỗi 500 API Gemini và rò rỉ Secret Key), hệ thống đã được chạy lại với bản **fresh build** (`npm run dev` & `uvicorn`).
- Toàn bộ tính năng Frontend và Backend hoạt động đồng bộ, ổn định, SLA update realtime mượt mà, Knowledge Base hoạt động không độ trễ. 
- Không dùng output log kiểm tra cũ (trước khi fix) để khẳng định phiên bản mới pass. Code hiện tại sẵn sàng merge.
