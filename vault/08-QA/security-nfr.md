# Security & Non-Functional Requirements (NFR) Evidence
**Project:** AI Helpdesk IT Ticket Management
**Date:** 2026-09-26

Tài liệu này cung cấp các bằng chứng về việc tuân thủ các yêu cầu Bảo mật (Security) và Yêu cầu Phi chức năng (NFR) của dự án.

---

## 1. Security Evidence (Bằng chứng Bảo mật)

### 1.1 RBAC (Role-Based Access Control)
- **Cơ chế:** Hệ thống sử dụng JWT Token để lưu trữ thông tin Role của người dùng (`Employee`, `Agent`, `Admin`). Ở phía Backend, các endpoint nhạy cảm được bảo vệ bởi middleware `get_current_user` và `RoleChecker`.
- **Bằng chứng (Test Cases):**
  - Khách hàng (Employee) không thể truy cập API của Agent (VD: Đóng vé của người khác, thay đổi Priority). Trả về HTTP `403 Forbidden`.
  - Khách vãng lai không có token truy cập API tạo vé. Trả về HTTP `401 Unauthorized`.

### 1.2 Validation & Sanitization
- **Cơ chế:** Mọi payload từ Frontend gửi lên đều phải đi qua chốt chặn của `Pydantic Models` (e.g. `TicketCreate`, `MessageCreate`). Các trường dữ liệu bị thiếu hoặc sai định dạng sẽ bị từ chối ngay ở lớp Router mà không chạm tới Database.
- **Bằng chứng:** 
  - Gửi request thiếu `title` hoặc `description` sẽ bị FastApi chặn lại và trả về mã lỗi HTTP `422 Unprocessable Entity`.
  - Gửi mã độc XSS/SQLi qua trường `description` sẽ được SQLAlchemy sanitize tự động qua parameter binding, ngăn chặn triệt để SQL Injection.

### 1.3 Secrets Management (Quản lý bí mật)
- **Bảo mật File:** Toàn bộ thông tin nhạy cảm (như `DATABASE_URL`, `JWT_SECRET_KEY`, `GEMINI_API_KEY`) đều được đưa vào file `.env`. File này đã được đưa vào `.gitignore` để tránh bị rò rỉ lên Github. Hệ thống chỉ đẩy file `.env.example` làm mẫu.
- **Mã hóa Password:** Mật khẩu người dùng trong cơ sở dữ liệu không bao giờ lưu plain-text, mà được băm (hash) 1 chiều bằng thuật toán `bcrypt` mạnh mẽ (thông qua thư viện `passlib`).
- **Không lộ Stack Trace:** FastAPI được cấu hình chạy ở chế độ Production. Khi có lỗi Internal Server Error (500), API chỉ trả về một thông báo lỗi generic (`"Internal Server Error"`), hoàn toàn không ném raw Stack Trace ra ngoài response gây lộ cấu trúc thư mục hay mã nguồn.

### 1.4 Dependency Check
- Dự án sử dụng công cụ quản lý package hiện đại `uv` kết hợp với `uv.lock`. Mọi dependency đều được ghim chặt phiên bản để đảm bảo hệ thống không bị tấn công qua các bản cập nhật thư viện độc hại (Supply Chain Attack).
- Cấu hình lock file ngăn chặn hoàn toàn hiện tượng "Hôm qua chạy được hôm nay lỗi do thư viện tự update".

---

## 2. NFR Evidence (Yêu cầu phi chức năng)

### 2.1 Basic Performance (Hiệu suất)
- **Kiến trúc Bất đồng bộ (Async):** Backend FastAPI kết hợp hoàn hảo với SQLAlchemy `asyncio` và Driver `asyncpg` (PostgreSQL). Tất cả các luồng truy xuất DB đều là Non-blocking, cho phép xử lý hàng ngàn request đồng thời mà không bị nghẽn (deadlock).
- **Background Tasks:** Việc gọi API sang Google Gemini AI để phân loại vé (AI Triage) tốn nhiều thời gian nên đã được tách ra chạy ngầm bằng `BackgroundTasks` của FastAPI. Nhờ đó, người dùng tạo vé xong sẽ nhận được phản hồi (201 Created) lập tức mà không phải chờ AI phản hồi.

### 2.2 Accessibility (A11y)
- Giao diện React/TailwindCSS được thiết kế tuân thủ các quy tắc semantic HTML cơ bản, sử dụng thẻ `<button>`, `<input>`, độ tương phản màu sắc rõ ràng (ví dụ: Chữ trắng trên nền xanh, Red cho cảnh báo lỗi), đảm bảo khả năng đọc dễ dàng cho người dùng.

### 2.3 Logging & Tracing
- **Database Logging:** `echo=True` trong SQLAlchemy (khi dev) giúp trace được từng dòng SQL sinh ra.
- **Application Logging:** Uvicorn ghi nhận log toàn bộ các request API đi vào hệ thống kèm theo Status Code và thời gian xử lý. Khi có lỗi (như lỗi AI Timeout), log sẽ in ra màn hình console (trong Docker container) để quản trị viên có thể điều tra (Investigate) mà không đẩy lỗi đó xuống Client.

---

## 3. Demo Unauthorized / Invalid Case
Dưới đây là mô phỏng quá trình Hệ thống từ chối yêu cầu không hợp lệ.

### Kịch bản 1: Không có quyền (Unauthorized - 401)
- **Tình huống:** Người lạ cố tình gọi API tạo vé mà không cung cấp JWT Token (Đã Fix tại BUG-01).
- **Kết quả trả về:**
```json
HTTP/1.1 401 Unauthorized
{
  "detail": "Not authenticated"
}
```
*(Hoàn toàn không có stack trace lộ ra)*

### Kịch bản 2: Sai quyền (Forbidden - 403)
- **Tình huống:** Người dùng Employee cố tình dùng token của mình để gọi API của Agent (Đóng vé của người khác).
- **Kết quả trả về:**
```json
HTTP/1.1 403 Forbidden
{
  "detail": "You do not have enough privileges"
}
```

### Kịch bản 3: Thiếu dữ liệu (Validation - 422)
- **Tình huống:** Gửi request tạo User nhưng cố tình để trống Password.
- **Kết quả trả về:**
```json
HTTP/1.1 422 Unprocessable Entity
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "String should have at least 1 character",
      "input": ""
    }
  ]
}
```
