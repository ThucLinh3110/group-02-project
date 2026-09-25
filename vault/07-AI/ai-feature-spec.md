# AI Feature Spec: IT Helpdesk Triage & Auto-Suggest

## 1. Business Value & Context
**Business Value**: Giảm thời gian chờ đợi (SLA) từ khâu tiếp nhận đến xử lý bằng cách phân loại tự động và gợi ý câu trả lời dựa trên Knowledge Base (KB). Đây không phải là Chatbot đàm thoại chung chung mà là một Agent tự động chẩn đoán lỗi IT nội bộ có kiểm soát.
**Context**: AI được kích hoạt tại 2 điểm chạm:
1. Khi khách hàng tạo vé mới (Auto-Triage chạy ngầm).
2. Khi IT Agent vào xem vé (Nhờ AI sinh câu trả lời Draft dựa trên tài liệu KB hiện có).

## 2. Structured Output & Validation
Để đảm bảo đầu ra chuẩn, AI bắt buộc phải trả về JSON cho tính năng Auto-Triage:
- **Quy tắc (Rules)**:
  - Chỉ chọn 1 trong 6 Category: Network, Hardware, Software, Account, Security, Khác.
  - Chỉ chọn 1 trong 4 Priority: Low, Medium, High, Urgent.
  - Phải có lý do (Reason).
  - Phải có mức độ tự tin (Confidence score float từ 0.0 đến 1.0).
- **Validation (Backend Enforced)**:
  - Backend parse JSON nghiêm ngặt. Nếu trả về chuỗi không phải JSON, bắt lỗi JSONDecodeError lập tức.
  - Validate Confidence >= 0.7. Nếu thấp hơn, tự động bật cờ `needs_manual_review` và hiển thị cảnh báo đỏ cho Quản lý.

## 3. Fallback Mechanism (Xử lý sự cố AI/Edge Cases)
Hệ thống KHÔNG ĐƯỢC CRASH khi mất mạng, AI sập hoặc hết Quota.
- **Trigger**: AI API Timeout (> 5s) hoặc Invalid Key/Connection Error.
- **Hành vi Fallback (Graceful Degradation)**:
  - Gắn Category = `Unknown`.
  - Gắn Priority = `Unassigned`.
  - Tự động chèn 1 System Message vào Ticket: *"AI đang bận hoặc gặp sự cố, chuyển sang phân công thủ công."*
  - Luồng hệ thống tiếp tục chạy trơn tru mà không chặn người dùng.

## 4. Evaluation Set (Đo lường & Kiểm chứng)
Dự án áp dụng bộ Test Benchmark gồm tối thiểu 20 cases (được lưu chi tiết tại `vault/08-QA/vault-qa-benchmark.md`).
- **Demo Requirements (Điều kiện Pass buổi báo cáo)**:
  - Trình diễn thành công tối thiểu 2 Happy Cases (Ví dụ: "Máy cháy" -> AI chẩn đoán Urgent/Hardware; "Wi-fi tầng 3 rớt" -> AI chẩn đoán High/Network).
  - Trình diễn thành công 1 Edge/Fallback Case (Cố tình làm sai API Key -> Bật cơ chế Fallback và ghi nhận System Message).

---

## 5. Mẫu Output #24 - AI Implementation Prompt + Verification
*(Dành cho việc sử dụng AI Agent để code tính năng AI vào hệ thống, giữ vững kiến trúc Production)*

**TASK**: T-601 - Implement AI Triage Trigger & Validation
**STORY**: US-HD-04
**CONTEXT**: Story Spec + BR-HD-01/02/03 + API contract.

### Rules:
- Không nhận `priority` từ Request của Customer làm source of truth (BR-HD-03).
- Check Authenticated Agent khi gọi API `/close` (BR-HD-02).
- Validate đầu ra của AI bắt buộc là JSON, nếu rác -> Fallback.
- Trả về typed domain errors hoặc chèn System Message đúng chuẩn.
- Không refactor module ngoài `ai_service` trừ khi thật sự cần thiết.

### Before coding:
Nêu plan, files, tests và rủi ro.

### After coding:
Chạy lint, typecheck, targeted tests và build; báo output thật.

### VERIFICATION EVIDENCE MẪU
```bash
$ uv run pytest tests/test_ai.py
12 passed, 0 failed

$ npm run typecheck
passed

$ npm run build
build completed successfully
```

### Human diff review:
- Không nhận Priority input từ Customer Update Request.
- Role dependency (`get_current_agent`) bảo vệ `close_ticket`.
- Lỗi Timeout được mapped đúng sang luồng Fallback, nhả System Message.
- Không có unrelated refactor ở các file/module khác.

---

## 6. Giai đoạn Code bằng AI nhưng giữ kiến trúc Production

### WORKFLOW MỖI TASK
1. Mở đúng story/spec; nói rõ file/module được phép sửa.
2. Yêu cầu AI đưa plan và danh sách file trước khi viết code.
3. Review plan: tránh thêm dependency/abstraction không cần thiết.
4. Cho AI implement từng lát nhỏ; sau mỗi lát chạy typecheck/lint/test.
5. Đọc diff; kiểm tra ownership của logic, error handling, security, naming, dead code.
6. Nếu prototype code được đưa vào production, tách module, state, API layer có chủ đích.
7. Tạo/ cập nhật test cùng task, không để “test sau”.
8. Commit/PR có Story ID; request review trước merge.

### Quy tắc component frontend
Mỗi component nên sở hữu tối đa khoảng 3 trách nhiệm. Logic phức tạp tách khỏi render; presentational component không tự fetch data; public API của module phải rõ; tránh component khổng lồ với nhiều boolean props.

### Prompt: Implementation Agent
> Bạn đang implement [TASK ID] thuộc [STORY ID].
> Hãy đọc Story Spec và chỉ sửa các module cần thiết.
> Trước tiên trả về:
> 1) Plan 3-7 bước.
> 2) File sẽ tạo/sửa và lý do.
> 3) Test sẽ thêm/chạy.
> 4) Rủi ro regression/security.
> 
> Chờ tôi duyệt plan trước khi implementation. Sau khi code xong, không được nói "done" cho đến khi có output thật của lint/typecheck/test/build.
