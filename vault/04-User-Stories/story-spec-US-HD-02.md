#  User Story 02: AI Phân loại thẻ vé tự động (AI Triage)

## 1. Thông tin chung
* **Epic:** #2 EP2: AI Triage
* **Owner:** Thục Linh

## 2. Mô tả (User Story)
**As a** IT Manager,
**I want** hệ thống AI tự động đọc mô tả thẻ vé mới và gán nhãn Category / Priority,
**So that** tôi không phải đọc và phân loại thủ công hàng chục vé mỗi ngày, giảm thời gian điều phối.

## 3. Luật nghiệp vụ (Business Rules)
* AI chỉ được phép gán nhãn dựa trên 5 Category cố định: `Hardware`, `Software`, `Network`, `Account`, `Other`.
* Đầu ra của AI phải được ép chuẩn theo định dạng JSON Schema.
* **Thời gian phản hồi tối đa (SLA):** API của AI phải trả kết quả trong vòng dưới 5 giây. Nếu quá 5 giây sẽ bị coi là Timeout.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria - BDD)

### Kịch bản 1: AI phân loại thành công (Happy Path - Trích từ Taiga #11)
* **Given (Bối cảnh):** Khách hàng gửi vé thành công với mô tả rõ ràng (VD: "Mất mạng wifi tầng 3").
* **When (Hành động):** Vé được lưu thành công vào hệ thống Database.
* **Then (Kết quả):** 
    * Hệ thống gọi AI phân tích.
    * AI trả về kết quả `Category = "Network"`, `Priority = "High"`.
    * Dashboard của IT Manager tự động cập nhật nhãn và màu sắc theo thời gian thực (Real-time).

### Kịch bản 2: AI không đủ dữ kiện kết luận (Low Confidence - Trích từ Taiga #12)
* **Given:** Khách hàng gửi vé với mô tả quá ngắn hoặc mờ hồ (VD: "Máy bị khùng").
* **When:** Hệ thống gọi AI phân tích nội dung.
* **Then:** 
    * AI trả về `Category = "Unknown"`.
    * Hệ thống đánh dấu vé này để Manager duyệt và phân loại thủ công.

### Kịch bản 3: Xử lý Fallback khi sập API (Timeout - Trích từ Taiga #12)
* **Given:** API của Gemini bị sập hoặc hệ thống mạng quá tải.
* **When:** Thời gian gọi API AI vượt quá 5 giây.
* **Then:** 
    * Hệ thống chủ động ngắt kết nối (Timeout).
    * Bỏ qua bước gọi AI và tự động gán nhãn mặc định là `"Unassigned"`.
    * Frontend không bị crash, hiển thị thông báo để Manager tự phân công vé.

## 5. Bằng chứng kiểm thử (Traceability)
* **Unit Test / E2E Test:** Tham khảo TC-04 tại file `testcase.md`
* **Pull Request (Mã nguồn):** PR #12 (Xử lý Fallback & Real-time)