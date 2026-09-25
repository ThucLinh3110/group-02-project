import os
import uuid

import httpx


BASE_URL = os.getenv("API_BASE_URL", "http://127.0.0.1:8000")


def test_login_and_create_ticket():
    username = os.getenv("TEST_USERNAME", "admin")
    password = os.getenv("TEST_PASSWORD", "123456")
    title = f"API test ticket {uuid.uuid4()}"

    with httpx.Client(base_url=BASE_URL, timeout=10) as client:
        login_response = client.post(
            "/api/auth/login",
            data={"username": username, "password": password},
        )

        assert login_response.status_code == 200, login_response.text
        login_data = login_response.json()
        assert login_data["access_token"]
        assert login_data["role"] == "Agent"

        ticket_response = client.post(
            "/api/tickets",
            files={
                "title": (None, title),
                "description": (None, "Created by the backend API test."),
            },
        )

        assert ticket_response.status_code == 200, ticket_response.text
        ticket = ticket_response.json()
        assert ticket["title"] == title
        assert ticket["description"] == "Created by the backend API test."
        assert ticket["ticket_code"].startswith("TKT-")