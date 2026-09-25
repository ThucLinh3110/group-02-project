# TÀI LIỆU HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH HỆ THỐNG (SYSTEM RUNBOOK)

**Tên dự án:** Hệ thống IT Helpdesk System
**Đơn vị thực hiện:** Nhóm 2
**Phiên bản phát hành:** v1.0.0
**Trạng thái tài liệu:** Ban hành

Tài liệu này cung cấp quy trình tiêu chuẩn để triển khai, cấu hình và vận hành dự án IT Helpdesk System trên môi trường cục bộ (Local Environment). Tài liệu phục vụ trực tiếp cho công tác bàn giao mã nguồn và đánh giá nghiệm thu hệ thống.

---

## 1. Yêu cầu cấu hình hệ thống (Prerequisites)

Để đảm bảo quá trình triển khai diễn ra đồng bộ và không phát sinh lỗi, máy chủ hoặc thiết bị kiểm thử cần được cài đặt sẵn các nền tảng sau:

- Hệ thống quản lý phiên bản: Git
- Nền tảng ảo hóa ứng dụng: Docker và Docker Compose (Được khuyến nghị để đồng bộ hóa môi trường)
- Nền tảng thực thi độc lập (Áp dụng trong trường hợp không sử dụng Docker):
  - Dành cho Backend: Python phiên bản 3.10 trở lên và trình quản lý gói `uv`.
  - Dành cho Frontend: Node.js phiên bản 18 trở lên.

## 2. Cấu hình biến môi trường (.env)

Nhằm tuân thủ các tiêu chuẩn về an toàn thông tin, tập tin cấu hình biến môi trường (`.env`) không được lưu trữ công khai trên kho mã nguồn Github. Người vận hành hệ thống cần khởi tạo tệp `.env` tại thư mục gốc của dự án và thiết lập các thông số sau:

```env
# Cấu hình kết nối API Khung Ngôn ngữ Lớn (LLM)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Cấu hình kết nối Cơ sở dữ liệu
DATABASE_URL=sqlite:///./helpdesk.db

# Cấu hình định tuyến kết nối từ Frontend đến Backend
VITE_API_BASE_URL=http://localhost:8000
```
*(Ghi chú: Khóa API thực tế sẽ được đính kèm riêng biệt trong biên bản bàn giao).*

## 3. Quy trình khởi chạy hệ thống

### 3.1. Phương pháp triển khai tự động qua Docker Compose (Khuyến nghị)
Phương pháp này thiết lập tự động hóa quá trình đóng gói (build) cho toàn bộ hệ thống Backend, Frontend và Cơ sở dữ liệu.

```bash
# Bước 1: Sao chép mã nguồn từ kho lưu trữ trung tâm
git clone https://github.com/ThucLinh3110/group-02-project.git
cd group-02-project

# Bước 2: Khởi tạo và thực thi các container
docker-compose up --build -d
```

Kết quả triển khai:
- Giao diện người dùng (Frontend): Truy cập tại `http://localhost:3000`
- Tài liệu API tiêu chuẩn OpenAPI (Backend): Truy cập tại `http://localhost:8000/docs`

### 3.2. Phương pháp triển khai thủ công (Dành cho quá trình phát triển)
Phương pháp này yêu cầu người vận hành mở hai phiên làm việc (terminal) hoạt động song song.

**Phiên làm việc 1: Khởi động dịch vụ Backend**
```bash
cd backend
uv sync
uv run uvicorn main:app --reload
```

**Phiên làm việc 2: Khởi động dịch vụ Frontend**
```bash
cd frontend
npm install
npm run dev
```

## 4. Khởi tạo dữ liệu cơ sở (Database Seeding)

Sau khi hệ thống khởi chạy thành công, để phục vụ công tác kiểm thử quy trình, cần tiến hành nạp tập dữ liệu giả lập (tài khoản người dùng và thông tin vé hỗ trợ) vào cơ sở dữ liệu:

```bash
cd backend
uv run python seed_users.py
```
*(Ghi chú: Tài khoản kiểm thử được hệ thống tạo tự động. Phân quyền Quản trị - Tên đăng nhập: `admin`, Mật khẩu: `123456`. Phân quyền IT Agent - Tên đăng nhập: `nv01`, Mật khẩu: `123456`).*

## 5. Quy trình xử lý sự cố cơ bản (Troubleshooting)

- **Sự cố 1: Tính năng AI phân loại vé không phản hồi hoặc phản hồi vượt quá thời gian quy định (Timeout).**
  - *Nguyên nhân:* Do giới hạn băng thông mạng hoặc hạn mức truy vấn (quota) của dịch vụ bên thứ ba (Gemini API) bị vượt ngưỡng.
  - *Biện pháp khắc phục:* Không yêu cầu can thiệp kỹ thuật trực tiếp. Hệ thống đã được lập trình sẵn cơ chế phòng vệ (Fallback). Khi nhận diện độ trễ tín hiệu, vé sẽ tự động được gán nhãn "Unassigned" (Chưa phân công) để đội ngũ IT tiếp nhận và phân loại thủ công, bảo đảm luồng công việc không bị gián đoạn và không gây lỗi crash hệ thống.

- **Sự cố 2: Báo lỗi xung đột cổng kết nối (Port Conflict) tại cổng 8000 hoặc 3000.**
  - *Nguyên nhân:* Môi trường thiết bị hiện tại đang có tiến trình (process) khác chiếm dụng cổng mạng tương ứng.
  - *Biện pháp khắc phục:* Tiến hành chấm dứt tiến trình đang chiếm dụng cổng, hoặc thay đổi cấu hình ánh xạ cổng trực tiếp trong tập tin `docker-compose.yaml`.