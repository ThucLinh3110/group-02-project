import pytest
from playwright.sync_api import Page, expect
import json

def test_tc166_ui_chat_renders_sender_messages_right_receiver_left(page: Page):
    def handle_login(route):
        route.fulfill(status=200, content_type="application/json", body=json.dumps({
            "access_token": "customer-token", "role": "Employee", "full_name": "Customer 1"
        }))
    page.route("**/api/auth/login", handle_login)

    def handle_ticket(route):
        route.fulfill(status=200, content_type="application/json", body=json.dumps({
            "id": 1, "ticket_code": "INC-123", "title": "Lỗi", "description": "Lỗi",
            "status": "New", "priority": "High", "category": "Network", "created_at": "2024-01-01",
            "messages": [
                {"id": 1, "ticket_id": 1, "sender_id": "emp_1", "sender_name": "Cus", "role": "Employee", "content": "Help", "created_at": "2024-01-01"},
                {"id": 2, "ticket_id": 1, "sender_id": "agent_1", "sender_name": "IT", "role": "Agent", "content": "Ok", "created_at": "2024-01-01"}
            ]
        }))
    page.route("**/api/tickets/1", handle_ticket)

    page.goto("http://localhost:5173/login")
    page.locator('input[type="text"]').fill("customer")
    page.locator('input[type="password"]').fill("123456")
    page.locator('button[type="submit"]').click()
    
    page.goto("http://localhost:5173/tickets/1")
    
    message_rows = page.locator(".flex.gap-3.max-w-\\[85\\%\\]")
    expect(message_rows).to_have_count(2)
    
    first_msg_class = message_rows.nth(0).get_attribute("class")
    assert "flex-row-reverse" in first_msg_class
    
    second_msg_class = message_rows.nth(1).get_attribute("class")
    assert "flex-row-reverse" not in second_msg_class

def test_tc167_dashboard_all_tickets_filter_shows_done_tickets(page: Page):
    def handle_login(route):
        route.fulfill(status=200, content_type="application/json", body=json.dumps({
            "access_token": "agent-token", "role": "Agent", "full_name": "IT Admin"
        }))
    page.route("**/api/auth/login", handle_login)

    def handle_metrics(route):
        route.fulfill(status=200, content_type="application/json", body=json.dumps({}))
    page.route("**/api/dashboard/sla-metrics", handle_metrics)

    def handle_tickets(route):
        route.fulfill(status=200, content_type="application/json", body=json.dumps([
            {"id": 99, "ticket_code": "INC-099", "title": "Ticket da xu ly xong", "status": "Closed", "priority": "Medium", "created_at": "2024-01-01"},
            {"id": 100, "ticket_code": "INC-100", "title": "Ticket dang mo", "status": "New", "priority": "High", "created_at": "2024-01-01"}
        ]))
    page.route("**/api/tickets", handle_tickets)

    page.goto("http://localhost:5173/login")
    page.locator('input[type="text"]').fill("admin")
    page.locator('input[type="password"]').fill("123456")
    page.locator('button[type="submit"]').click()
    
    expect(page).to_have_url("http://localhost:5173/")
    
    page.get_by_role("button", name="All Tickets").click()
    
    expect(page.get_by_text("Ticket da xu ly xong")).to_be_visible()
    expect(page.get_by_text("Ticket dang mo")).to_be_visible()
