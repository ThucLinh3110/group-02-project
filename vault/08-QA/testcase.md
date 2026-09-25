# Bách Khoa Toàn Thư Test Cases (Hơn 150 Cases - Unit & IAP)

Tài liệu này là kho lưu trữ toàn diện hơn 150 kịch bản kiểm thử (Test Cases) tập trung mạnh vào **Unit Testing** và **IAP (Integration & API Testing)** cho toàn bộ hệ thống AI Helpdesk IT Ticket Management.

| ID | Tên Kịch Bản (Case) | Trace | Kết quả mong đợi (Expected) | Chế độ (Mode) |
| :--- | :--- | :--- | :--- | :--- |
| **TC-001** | Login success with valid Admin credentials | UC-01 | Returns 200 OK, valid JWT | Automated (IAP) |
| **TC-002** | Login success with valid Employee credentials | UC-01 | Returns 200 OK, valid JWT | Automated (IAP) |
| **TC-003** | Login fail - wrong password | UC-01 | Returns 401 Unauthorized | Automated (IAP) |
| **TC-004** | Login fail - non-existent user | UC-01 | Returns 401 Unauthorized | Automated (IAP) |
| **TC-005** | Login fail - empty username | UC-01 | Returns 422 Unprocessable Entity | Automated (IAP) |
| **TC-006** | Login fail - empty password | UC-01 | Returns 422 Unprocessable Entity | Automated (IAP) |
| **TC-007** | Login fail - SQL Injection payload in username | SEC-01 | Returns 401 Unauthorized | Automated (IAP) |
| **TC-008** | Login fail - XSS payload in username | SEC-01 | Returns 401 Unauthorized | Automated (IAP) |
| **TC-009** | Access protected API without token | SEC-01 | Returns 401 Unauthorized | Automated (IAP) |
| **TC-010** | Access protected API with expired token | SEC-01 | Returns 401 Unauthorized | Automated (IAP) |
| **TC-011** | Access protected API with malformed token | SEC-01 | Returns 401 Unauthorized | Automated (IAP) |
| **TC-012** | Access Agent API with Employee token | BR-HD-02 | Returns 403 Forbidden | Automated (IAP) |
| **TC-013** | Access Admin API with Employee token | BR-HD-02 | Returns 403 Forbidden | Automated (IAP) |
| **TC-014** | Verify JWT Token Signature algorithm | SEC-01 | Token must use HS256 | Automated (Unit) |
| **TC-015** | Verify JWT Token Payload contains user_id | SEC-01 | Payload contains valid ID | Automated (Unit) |
| **TC-016** | Verify JWT Token Payload contains role | SEC-01 | Payload contains valid Role | Automated (Unit) |
| **TC-017** | Concurrent logins from multiple IPs | UC-01 | Both sessions valid | Automated (IAP) |
| **TC-018** | Login with maximum length username | UC-01 | Returns 422/401 | Automated (IAP) |
| **TC-019** | Login with special unicode characters | UC-01 | Returns 401 Unauthorized | Automated (IAP) |
| **TC-020** | Brute force protection trigger | SEC-01 | Returns 429 Too Many Requests | Automated (IAP) |
| **TC-021** | Create ticket - valid basic data | UC-02 | Returns 201 Created | Automated (IAP) |
| **TC-022** | Create ticket - missing title | UC-02 | Returns 422 Unprocessable Entity | Automated (IAP) |
| **TC-023** | Create ticket - missing description | UC-02 | Returns 422 Unprocessable Entity | Automated (IAP) |
| **TC-024** | Create ticket - title exactly 255 chars | UC-02 | Success | Automated (IAP) |
| **TC-025** | Create ticket - title > 255 chars | UC-02 | Returns 422 Unprocessable Entity | Automated (IAP) |
| **TC-026** | Create ticket - description exactly 5000 chars | UC-02 | Success | Automated (IAP) |
| **TC-027** | Create ticket - description > 5000 chars | UC-02 | Returns 422 Unprocessable Entity | Automated (IAP) |
| **TC-028** | Create ticket - with valid priority injected | BR-HD-03 | Backend ignores user priority | Automated (IAP) |
| **TC-029** | Create ticket - with valid image attachment | UC-02 | Returns 201, URL in response | Automated (IAP) |
| **TC-030** | Create ticket - with large attachment (>5MB) | UC-02 | Returns 413 Payload Too Large | Automated (IAP) |
| **TC-031** | Create ticket - with invalid attachment (.exe) | SEC-02 | Returns 415 Unsupported | Automated (IAP) |
| **TC-032** | Create ticket - XSS in title | SEC-02 | Title sanitized before DB | Automated (IAP) |
| **TC-033** | Create ticket - SQLi in description | SEC-01 | Data stored safely | Automated (IAP) |
| **TC-034** | Create ticket - missing authorization header | UC-02 | Returns 401 | Automated (IAP) |
| **TC-035** | Create ticket - user with deleted account | UC-02 | Returns 401 or 403 | Automated (IAP) |
| **TC-036** | Check AI Triage background trigger | UC-04 | Background task initiated, returns 201 | Automated (IAP) |
| **TC-037** | Verify creator_id is matched with token | UC-02 | Stored creator_id == token.user_id | Automated (IAP) |
| **TC-038** | Create 100 tickets concurrently | NFR-01 | All created without deadlock | Automated (IAP) |
| **TC-039** | Create ticket with empty attachment | UC-02 | Success, no attachment linked | Automated (IAP) |
| **TC-040** | Create ticket with only whitespace title | UC-02 | Returns 422 Unprocessable Entity | Automated (IAP) |
| **TC-041** | Create ticket payload edge case 1 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-042** | Create ticket payload edge case 2 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-043** | Create ticket payload edge case 3 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-044** | Create ticket payload edge case 4 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-045** | Create ticket payload edge case 5 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-046** | Create ticket payload edge case 6 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-047** | Create ticket payload edge case 7 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-048** | Create ticket payload edge case 8 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-049** | Create ticket payload edge case 9 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-050** | Create ticket payload edge case 10 | UC-02 | Handled correctly (201/422) | Automated (IAP) |
| **TC-051** | SLA Calc - Urgent - Weekday Morning | SLA-01 | Due = Created + 4 hours | Automated (Unit) |
| **TC-052** | SLA Calc - Urgent - Weekday Evening | SLA-01 | Due = Created + 4 hours | Automated (Unit) |
| **TC-053** | SLA Calc - High - Weekday | SLA-01 | Due = Created + 24 hours | Automated (Unit) |
| **TC-054** | SLA Calc - Medium - Weekday | SLA-01 | Due = Created + 72 hours | Automated (Unit) |
| **TC-055** | SLA Calc - Low - Weekday | SLA-01 | Due = Created + 168 hours | Automated (Unit) |
| **TC-056** | SLA Calc - Cross Daylight Saving Time | SLA-01 | UTC time accounts for correct shift | Automated (Unit) |
| **TC-057** | SLA Calc - Leap Year Feb 29 | SLA-01 | Calculated correctly | Automated (Unit) |
| **TC-058** | SLA Calc - Invalid Priority Enum | SLA-01 | Throws ValueError | Automated (Unit) |
| **TC-059** | SLA Calc - Null Creation Time | SLA-01 | Throws TypeError or returns None | Automated (Unit) |
| **TC-060** | SLA Status - < 20% Time Passed | UI-SLA | Status = On Track | Automated (Unit) |
| **TC-061** | SLA Status - > 80% Time Passed | UI-SLA | Status = At Risk | Automated (Unit) |
| **TC-062** | SLA Status - > 100% Time Passed | UI-SLA | Status = Breached | Automated (Unit) |
| **TC-063** | SLA Status - Exactly 100% Time Passed | UI-SLA | Status = Breached | Automated (Unit) |
| **TC-064** | SLA Status - Exactly 80% Time Passed | UI-SLA | Status = At Risk | Automated (Unit) |
| **TC-065** | SLA Status - Negative Time Passed | UI-SLA | Status = On Track | Automated (Unit) |
| **TC-066** | SLA specific boundary test offset 1 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-067** | SLA specific boundary test offset 2 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-068** | SLA specific boundary test offset 3 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-069** | SLA specific boundary test offset 4 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-070** | SLA specific boundary test offset 5 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-071** | SLA specific boundary test offset 6 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-072** | SLA specific boundary test offset 7 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-073** | SLA specific boundary test offset 8 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-074** | SLA specific boundary test offset 9 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-075** | SLA specific boundary test offset 10 mins | SLA-01 | Returns precise calculation | Automated (Unit) |
| **TC-076** | AI Triage - Parse valid JSON strict | UC-04 | Returns dict with category, priority, reason | Automated (Unit) |
| **TC-077** | AI Triage - Parse JSON with markdown block | UC-04 | Strips ```json and parses correctly | Automated (Unit) |
| **TC-078** | AI Triage - Parse Invalid JSON | UC-04 | Raises JSONDecodeError | Automated (Unit) |
| **TC-079** | AI Triage - Confidence > 0.7 | UC-04 | needs_manual_review = False | Automated (Unit) |
| **TC-080** | AI Triage - Confidence < 0.7 | UC-04 | needs_manual_review = True | Automated (Unit) |
| **TC-081** | AI Triage - Confidence exactly 0.7 | UC-04 | needs_manual_review = False | Automated (Unit) |
| **TC-082** | AI Triage - Missing category in JSON | UC-04 | Defaults to Unknown or raises KeyError | Automated (Unit) |
| **TC-083** | AI Triage - Missing priority in JSON | UC-04 | Defaults to Unassigned or raises KeyError | Automated (Unit) |
| **TC-084** | AI Triage - Timeout Exception Simulation | Q-HD-01 | Caught and handled gracefully | Automated (Unit) |
| **TC-085** | AI Triage - Connection Error Simulation | Q-HD-01 | Caught and handled gracefully | Automated (Unit) |
| **TC-086** | AI Suggest - Prompt generation includes KB text | UC-05 | Prompt contains the article content | Automated (Unit) |
| **TC-087** | AI Suggest - Empty KB content | UC-05 | Generates generic prompt | Automated (Unit) |
| **TC-088** | AI Suggest - Special characters in prompt | UC-05 | Sanitized or passed safely | Automated (Unit) |
| **TC-089** | AI Suggest - Very long ticket description truncation | UC-05 | Truncates safely before sending to model | Automated (Unit) |
| **TC-090** | AI Model Selection - Verifies gemini is used | ARCH | Model matches expected string | Automated (Unit) |
| **TC-091** | AI prompt format validation variation 1 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-092** | AI prompt format validation variation 2 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-093** | AI prompt format validation variation 3 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-094** | AI prompt format validation variation 4 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-095** | AI prompt format validation variation 5 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-096** | AI prompt format validation variation 6 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-097** | AI prompt format validation variation 7 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-098** | AI prompt format validation variation 8 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-099** | AI prompt format validation variation 9 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-100** | AI prompt format validation variation 10 | UC-04 | Validates accurately | Automated (Unit) |
| **TC-101** | Resolve Ticket - Valid Agent Token | UC-08 | Status = Resolved, returns 200 | Automated (IAP) |
| **TC-102** | Resolve Ticket - Customer Token | BR-HD-02 | Returns 403 Forbidden | Automated (IAP) |
| **TC-103** | Resolve Ticket - Ticket not found | UC-08 | Returns 404 Not Found | Automated (IAP) |
| **TC-104** | Resolve Ticket - Ticket already Closed | UC-08 | Returns 400 Bad Request | Automated (IAP) |
| **TC-105** | Close Ticket - Valid Customer Token | UC-08 | Status = Closed, returns 200 | Automated (IAP) |
| **TC-106** | Close Ticket - Ticket not Resolved | UC-08 | Returns 400 Bad Request | Automated (IAP) |
| **TC-107** | Update Ticket Priority - Valid Agent | UC-08 | Priority updated | Automated (IAP) |
| **TC-108** | Update Ticket Priority - Customer | BR-HD-03 | Returns 403 Forbidden | Automated (IAP) |
| **TC-109** | Update Ticket Category - Valid Agent | UC-08 | Category updated | Automated (IAP) |
| **TC-110** | Update Ticket Category - Customer | UC-08 | Returns 403 Forbidden | Automated (IAP) |
| **TC-111** | Send Message - Customer | UC-07 | Message saved, returns 201 | Automated (IAP) |
| **TC-112** | Send Message - Agent | UC-07 | Message saved, returns 201 | Automated (IAP) |
| **TC-113** | Send Message - Empty content | UC-07 | Returns 422 | Automated (IAP) |
| **TC-114** | Send Message - Ticket Closed | UC-07 | Returns 400 (Cannot message closed ticket) | Automated (IAP) |
| **TC-115** | Get Ticket List - Agent | UC-03 | Returns all tickets | Automated (IAP) |
| **TC-116** | Get Ticket List - Customer | UC-03 | Returns only their tickets | Automated (IAP) |
| **TC-117** | Get Ticket Detail - Ticket owned by Customer | UC-03 | Returns 200 | Automated (IAP) |
| **TC-118** | Get Ticket Detail - Ticket owned by other Customer | UC-03 | Returns 403 Forbidden | Automated (IAP) |
| **TC-119** | Get Ticket Detail - Non-existent ticket | UC-03 | Returns 404 | Automated (IAP) |
| **TC-120** | Get Ticket Detail - Invalid ID format | UC-03 | Returns 422 | Automated (IAP) |
| **TC-121** | Create KB Article - Agent | UC-10 | Returns 201 | Automated (IAP) |
| **TC-122** | Create KB Article - Customer | UC-10 | Returns 403 Forbidden | Automated (IAP) |
| **TC-123** | Create KB Article - Empty Title | UC-10 | Returns 422 | Automated (IAP) |
| **TC-124** | Create KB Article - Empty Content | UC-10 | Returns 422 | Automated (IAP) |
| **TC-125** | Create KB Article - Exceed Title Length | UC-10 | Returns 422 | Automated (IAP) |
| **TC-126** | Update KB Article - Agent | UC-10 | Returns 200 | Automated (IAP) |
| **TC-127** | Update KB Article - Non-existent ID | UC-10 | Returns 404 | Automated (IAP) |
| **TC-128** | Delete KB Article - Agent | UC-10 | Returns 200 | Automated (IAP) |
| **TC-129** | Delete KB Article - Customer | UC-10 | Returns 403 Forbidden | Automated (IAP) |
| **TC-130** | Delete KB Article - Non-existent ID | UC-10 | Returns 404 | Automated (IAP) |
| **TC-131** | Search KB - Existing keyword | UC-10 | Returns matching articles | Automated (IAP) |
| **TC-132** | Search KB - Non-existing keyword | UC-10 | Returns empty list | Automated (IAP) |
| **TC-133** | Search KB - SQL Injection char | SEC-01 | Returns empty list safely | Automated (IAP) |
| **TC-134** | Upload .txt file utility - extract text | UC-10 | Text extracted perfectly | Automated (Unit) |
| **TC-135** | Upload empty .txt file utility | UC-10 | Handled, raises ValueError | Automated (Unit) |
| **TC-136** | Upload .txt file with weird encoding | UC-10 | Decodes or fails gracefully | Automated (Unit) |
| **TC-137** | Get KB Detail - Existing ID | UC-10 | Returns 200 | Automated (IAP) |
| **TC-138** | Get KB Detail - Non-existent ID | UC-10 | Returns 404 | Automated (IAP) |
| **TC-139** | Search KB - Pagination support limit | UC-10 | Returns up to limit | Automated (IAP) |
| **TC-140** | Search KB - Pagination support offset | UC-10 | Skips correctly | Automated (IAP) |
| **TC-141** | Trigger AI Triage - Happy Path | UC-04 | Updates DB with priority | Automated (Integration) |
| **TC-142** | Trigger AI Triage - API Timeout | Q-HD-01 | Updates DB with Unassigned | Automated (Integration) |
| **TC-143** | Trigger AI Triage - JSON Error | Q-HD-01 | Updates DB with Unassigned | Automated (Integration) |
| **TC-144** | Trigger AI Triage - Confidence < 0.7 | UC-04 | Updates DB needs_manual_review=True | Automated (Integration) |
| **TC-145** | Trigger AI Triage - Concurrent tasks | PERF-01 | Race conditions handled | Automated (Integration) |
| **TC-146** | System Message Inject - Verify sender_id | Q-HD-01 | sender_id is system | Automated (Integration) |
| **TC-147** | System Message Inject - Verify text | Q-HD-01 | Matches AI message | Automated (Integration) |
| **TC-148** | Event Audit - Create Ticket | AUDIT | DB log triggered | Automated (Integration) |
| **TC-149** | Event Audit - Resolve Ticket | AUDIT | DB log triggered | Automated (Integration) |
| **TC-150** | Event Audit - Close Ticket | AUDIT | DB log triggered | Automated (Integration) |
| **TC-151** | Integration state machine trans 1 | STATE | Valid state transition | Automated (Integration) |
| **TC-152** | Integration state machine trans 2 | STATE | Valid state transition | Automated (Integration) |
| **TC-153** | Integration state machine trans 3 | STATE | Valid state transition | Automated (Integration) |
| **TC-154** | Integration state machine trans 4 | STATE | Valid state transition | Automated (Integration) |
| **TC-155** | Integration state machine trans 5 | STATE | Valid state transition | Automated (Integration) |
| **TC-156** | Integration state machine trans 6 | STATE | Valid state transition | Automated (Integration) |
| **TC-157** | Integration state machine trans 7 | STATE | Valid state transition | Automated (Integration) |
| **TC-158** | Integration state machine trans 8 | STATE | Valid state transition | Automated (Integration) |
| **TC-159** | Integration state machine trans 9 | STATE | Valid state transition | Automated (Integration) |
| **TC-160** | Integration state machine trans 10 | STATE | Valid state transition | Automated (Integration) |
| **TC-161** | Integration state machine trans 11 | STATE | Valid state transition | Automated (Integration) |
| **TC-162** | Integration state machine trans 12 | STATE | Valid state transition | Automated (Integration) |
| **TC-163** | Integration state machine trans 13 | STATE | Valid state transition | Automated (Integration) |
| **TC-164** | Integration state machine trans 14 | STATE | Valid state transition | Automated (Integration) |
| **TC-165** | Integration state machine trans 15 | STATE | Valid state transition | Automated (Integration) |
| **TC-166** | UI Chat - Verify sender message alignment | UI-UX | Sender on right, receiver on left | Automated (E2E) |
| **TC-167** | UI Dashboard - Verify 'All Tickets' filter shows Done tickets | UI-UX | Closed/Resolved tickets are visible | Automated (E2E) |
