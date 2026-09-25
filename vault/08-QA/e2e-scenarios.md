# Kịch bản Kiểm thử E2E (E2E Scenarios)

Tài liệu này định nghĩa các kịch bản kiểm thử End-to-End (E2E) quan trọng nhất của hệ thống AI Helpdesk IT Ticket Management, viết dưới dạng **BDD (Behavior-Driven Development) / Given-When-Then** để dễ dàng chuyển đổi thành code automation (Playwright/Cypress).

---

## Scenario 1: Khách hàng và IT hoàn thành luồng xử lý vé với AI hỗ trợ (Happy Path)

**Given** customer (nv01) is logged in  
**And** Knowledge Base contains an article about "Lỗi màn hình xanh"  
**When** customer submits a new ticket with description "máy tính tự khởi động lại rồi hiện màn hình xanh"  
**Then** system creates a new ticket with status "New"  
**And** background AI Triage classifies the ticket as category "Hardware" and priority "Urgent"  
**And** backend automatically sets SLA due date to 4 hours from creation time  
**When** IT Agent (admin) logs in and views the ticket  
**And** IT Agent clicks the "Nhờ AI Gợi Ý" (AI Draft) button  
**Then** app displays a drafted response based on the Knowledge Base article  
**When** IT Agent sends the response and chooses "Đánh dấu đã giải quyết (Resolve)"  
**Then** ticket status changes to "Resolved"  
**And** customer's UI displays the "Nghiệm thu & Đóng vé" button  
**When** customer clicks "Nghiệm thu & Đóng vé"  
**Then** ticket status changes to "Closed"  
**And** audit events / database records correctly reflect the lifecycle state changes.

---

## Scenario 2: Hệ thống tự động fallback khi AI gặp sự cố (Failure Path / Edge Case)

**Given** customer (nv01) is logged in  
**And** Gemini AI API key is invalid or network is down (triggering > 5s timeout)  
**When** customer submits a new ticket with description "mạng wifi tầng 3 bị đứt"  
**Then** system successfully creates the ticket without crashing the web app  
**And** background AI Triage encounters an API error/timeout  
**Then** system automatically assigns category "Unknown" and priority "Unassigned"  
**And** system flags the ticket with `needs_manual_review = true`  
**And** system automatically injects a System Message: *"AI đang bận hoặc gặp sự cố, chuyển sang phân công thủ công."*  
**When** IT Manager logs in  
**Then** they see the red alert box on the ticket  
**And** they can manually update the ticket's tags (Category/Priority) via the UI to bypass the AI failure.

---

## Scenario 3: Backend ngăn chặn khách hàng vượt quyền (Security Enforcements)

**Given** customer (nv01) is logged in  
**And** ticket TKT-1001 is already classified by AI with priority "Low"  
**When** customer attempts to bypass UI and sends a PATCH request to API `/api/tickets/1001` with `{"priority": "Urgent"}`  
**Then** backend returns `403 Forbidden` error  
**And** ticket priority remains "Low"  
**When** customer attempts to call the POST API `/api/tickets/1001/resolve`  
**Then** backend returns `401 Unauthorized` or `403 Forbidden`  
**And** ticket status remains unchanged.
