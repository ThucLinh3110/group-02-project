#  User Story 04: Quản lý SLA

## 1. Thông tin chung
* **Epic:** #4 EP4: SLA
* **Owner:** Diệu Ngân

## 2. Mô tả (User Story)
* **US-HD-04.1:** As an Agent, I want to xem thời gian đếm ngược SLA và badge màu tương ứng trên từng ticket, so that tôi có thể dễ dàng nhận biết ticket nào sắp trễ hạn để ưu tiên xử lý trước.
* **US-HD-04.2:** As an IT Manager, I want to xem bảng thống kê tổng quan các chỉ số SLA (On track, At risk, Breached), so that tôi đánh giá được hiệu suất làm việc của team và có biện pháp can thiệp kịp thời đối với các ticket bị trễ. 

## 3. Tiêu chí nghiệm thu (Acceptance Criteria - BDD)

### 3.1 Hệ thống đếm ngược và gắn badge cảnh báo SLA (US-HD-04.1)
* **Kịch bản đếm ngược và hiển thị Badge bình thường (On track):**
  * **Given:** Ticket đang ở trạng thái chưa hoàn thành (New / In Progress) và thời gian SLA còn > 25%.
  * **When:** Agent xem danh sách hoặc chi tiết ticket.
  * **Then:** Hệ thống hiển thị đồng hồ đếm ngược đi kèm Badge màu Xanh (On track).
* **Kịch bản đổi màu Badge cảnh báo khi sắp quá hạn (At risk):**
  * **Given:** Ticket chưa xong và thời gian SLA còn < 25% (hoặc dưới 1 tiếng).
  * **When:** Hệ thống cập nhật thời gian real-time.
  * **Then:** Badge tự động chuyển sang màu Vàng/Cam (At risk) để thu hút sự chú ý của Agent.
* **Kịch bản đánh dấu vi phạm khi hết thời gian (Breached):**
  * **Given:** Ticket chưa chuyển sang Resolved hoặc Closed khi đồng hồ SLA về 00:00.
  * **When:** Quá thời hạn SLA quy định.
  * **Then:** Badge tự động chuyển sang màu Đỏ (Breached) và ghi nhận trạng thái vi phạm vào log của ticket.

### 3.2 Dashboard thống kê vé trễ hạn cho IT Manager (US-HD-04.2)
* **Hiển thị các thẻ chỉ số tổng quan (Metric Cards):**
  * **Given:** IT Manager truy cập vào màn hình SLA Dashboard.
  * **When:** Trang web tải xong dữ liệu.
  * **Then:** Bảng điều khiển hiển thị 3 thẻ số liệu tổng quan rõ ràng: Số vé đúng hạn (On track), Số vé nguy cơ (At risk), và Số vé đã trễ hạn (Breached).
* **Lọc danh sách ticket trễ hạn trực tiếp từ Dashboard:**
  * **Given:** IT Manager đang ở màn hình SLA Dashboard.
  * **When:** Manager nhấp vào thẻ số liệu Breached hoặc At risk.
  * **Then:** Bảng danh sách bên dưới lập tức lọc và chỉ hiển thị các ticket thuộc trạng thái đó để Manager tiện xử lý.