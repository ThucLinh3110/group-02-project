# Danh sách Test Cases (Test Matrix)

Tài liệu này lưu trữ danh sách các kịch bản kiểm thử (Test Cases) chi tiết bao phủ toàn bộ các Module của hệ thống AI Helpdesk IT Ticket Management (Frontend, Backend API, AI, Database).

## 1. Authentication & Authorization (Xác thực & Phân quyền)
| ID | Case (Kịch bản) | Trace (Tham chiếu) | Expected (Kết quả mong đợi) | Mode |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Khách hàng đăng nhập đúng User/Pass | UC-01 | Trả về JWT, Role=Employee, vào màn Home | Automated |
| **TC-02** | IT Agent đăng nhập đúng User/Pass | UC-01 | Trả về JWT, Role=Agent, vào màn Dashboard | Automated |
| **TC-03** | Đăng nhập sai Username hoặc Password | UC-01 | Trả về HTTP 401, hiển thị lỗi "Tài khoản không đúng" | Automated |
| **TC-04** | Gọi API bằng Token hết hạn/sai chữ ký | SEC-01 | HTTP 401 Unauthorized, yêu cầu đăng nhập lại | Automated |
| **TC-05** | Customer cố tình gọi API `/api/kb` (CRUD tri thức) | BR-HD-02 | HTTP 403 Forbidden | Automated |
| **TC-06** | Customer cố tình gọi API `/resolve` (Đánh dấu hoàn thành) | BR-HD-02 | HTTP 403 Forbidden | Automated |
| **TC-07** | Customer truyền thêm `priority=Urgent` khi tạo/cập nhật vé | BR-HD-03 | Backend bỏ qua hoặc trả 403, giữ nguyên kết quả của AI | Automated |

## 2. Ticket Lifecycle (Luồng sinh mệnh của Vé)
| ID | Case (Kịch bản) | Trace (Tham chiếu) | Expected (Kết quả mong đợi) | Mode |
| :--- | :--- | :--- | :--- | :--- |
| **TC-08** | Tạo vé mới chỉ có Tiêu đề & Mô tả | UC-02 | Vé tạo thành công, Status = New | Automated |
| **TC-09** | Tạo vé mới có đính kèm file ảnh (.jpg, .png) | UC-02 | File upload thành công, vé lưu URL ảnh hợp lệ | Automated |
| **TC-10** | Tạo vé mới nhưng bỏ trống Mô tả | UC-02 | Validate Form bắt buộc nhập, không gọi API | Manual/E2E |
| **TC-11** | Customer xem danh sách vé của mình | UC-03 | Chỉ hiển thị vé do chính Customer đó tạo | Automated |
| **TC-12** | IT Agent xem danh sách vé | UC-03 | Hiển thị tất cả vé trong hệ thống | Automated |
| **TC-13** | Khách hàng và Agent nhắn tin trao đổi trong vé | UC-07 | Tin nhắn hiển thị real-time, lưu đúng Sender Name/Role | Automated |
| **TC-14** | IT Agent bấm "Resolve" vé đang xử lý | UC-08 | Vé chuyển sang Resolved, hiện thông báo cho Customer | Automated |
| **TC-15** | Customer bấm "Close" (Nghiệm thu) vé đã Resolve | UC-08 | Vé chuyển sang Closed, khóa comment | Automated |

## 3. SLA Monitor (Đếm ngược thời gian xử lý)
| ID | Case (Kịch bản) | Trace (Tham chiếu) | Expected (Kết quả mong đợi) | Mode |
| :--- | :--- | :--- | :--- | :--- |
| **TC-16** | Khởi tạo vé có Priority = Urgent | SLA-01 | `sla_due_at` = `created_at` + 4 giờ | Automated |
| **TC-17** | Khởi tạo vé có Priority = High | SLA-01 | `sla_due_at` = `created_at` + 24 giờ | Automated |
| **TC-18** | Khởi tạo vé có Priority = Medium | SLA-01 | `sla_due_at` = `created_at` + 3 ngày (72 giờ) | Automated |
| **TC-19** | Khởi tạo vé có Priority = Low | SLA-01 | `sla_due_at` = `created_at` + 7 ngày (168 giờ) | Automated |
| **TC-20** | Ticket còn nhiều thời gian (Thời gian đã qua < 80%) | UI-SLA | SLA Badge hiển thị màu Xanh (On Track) | E2E |
| **TC-21** | Ticket sắp tới hạn (Thời gian đã qua > 80%) | UI-SLA | SLA Badge hiển thị màu Vàng (At Risk) | E2E |
| **TC-22** | Ticket trôi qua khỏi mốc `sla_due_at` | UI-SLA | SLA Badge hiển thị màu Đỏ (SLA Breached / Overdue) | E2E |
| **TC-23** | Đồng hồ đếm ngược SLA trên UI | UI-SLA | Giảm dần theo thời gian thực mà không cần reload trang | Manual |

## 4. AI Triage & Suggestion (Trí tuệ nhân tạo)
| ID | Case (Kịch bản) | Trace (Tham chiếu) | Expected (Kết quả mong đợi) | Mode |
| :--- | :--- | :--- | :--- | :--- |
| **TC-24** | Mô tả lỗi phần cứng rõ ràng ("Máy bốc khói") | UC-04 | AI gán Category=Hardware, Priority=Urgent | Automated |
| **TC-25** | Mô tả lỗi siêu ngắn gọn ("máy cháy") | UC-04 | Bỏ qua chặn độ dài tối thiểu, AI vẫn phân loại Urgent | Automated |
| **TC-26** | AI Triage bị Timeout (>5s) hoặc Đứt mạng | Q-HD-01 | Vé không lỗi, tự gán Unknown/Unassigned | Automated |
| **TC-27** | AI Triage rơi vào luồng Fallback | Q-HD-01 | Tự động chèn System Message: "AI đang bận..." | Automated |
| **TC-28** | AI trả về JSON lỗi (Mô hình sinh ra text thường) | Q-HD-01 | Backend bắt JSONDecodeError, kích hoạt Fallback | Automated |
| **TC-29** | AI phân loại với Confidence < 0.7 | UC-04 | Bật cờ `needs_manual_review = true`, hiển thị cảnh báo đỏ | Automated |
| **TC-30** | IT Agent bấm "Nhờ AI Gợi Ý" có bài KB liên quan | UC-05 | Lấy đúng context từ DB, nhả ra text Draft chính xác | Automated |
| **TC-31** | IT Agent bấm "Nhờ AI Gợi Ý" nhưng không có KB | UC-05 | API trả về cờ `no_match` hoặc câu trả lời chung chung | Automated |

## 5. Knowledge Base (Quản lý Tri thức)
| ID | Case (Kịch bản) | Trace (Tham chiếu) | Expected (Kết quả mong đợi) | Mode |
| :--- | :--- | :--- | :--- | :--- |
| **TC-32** | Tải lên file `.txt` dung lượng nhỏ | UC-10 | Extract đúng nội dung text, lưu bài KB mới | Automated |
| **TC-33** | Tìm kiếm bài viết KB theo Tiêu đề | UC-10 | Trả về các bài viết chứa từ khóa ở Title | Automated |
| **TC-34** | Tìm kiếm bài viết KB theo Nội dung (Content) | UC-10 | Trả về các bài viết chứa từ khóa ở Body | Automated |
| **TC-35** | Cập nhật (Edit) nội dung bài viết KB | UC-10 | Lưu thay đổi thành công, `updated_at` được cập nhật | Automated |
| **TC-36** | Xóa (Delete) bài viết KB | UC-10 | Báo thành công 200 OK, biến mất khỏi giao diện | Automated |

## 6. Non-Functional (Phi chức năng)
| ID | Case (Kịch bản) | Trace (Tham chiếu) | Expected (Kết quả mong đợi) | Mode |
| :--- | :--- | :--- | :--- | :--- |
| **TC-37** | Kiểm tra hiển thị trên màn hình Mobile (iPhone 12) | NFR-01 | Layout không vỡ, form nhập chat tự scale | Manual |
| **TC-38** | Rò rỉ bộ nhớ (Memory Leak) ở Component đếm giờ | NFR-02 | Unmount component giải phóng interval (không báo lỗi console) | Manual |
| **TC-39** | Rò rỉ bảo mật (Secrets Leak) | NFR-03 | File `.env` chứa `GEMINI_API_KEY` nằm trong `.gitignore`, không push lên Git | Automated |
