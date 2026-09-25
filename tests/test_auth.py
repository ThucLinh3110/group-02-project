import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_login_success_agent(async_client: AsyncClient):
    response = await async_client.post("/api/auth/login", data={
        "username": "agent1",
        "password": "password"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "Agent"

@pytest.mark.asyncio
async def test_login_success_customer(async_client: AsyncClient):
    response = await async_client.post("/api/auth/login", data={
        "username": "customer1",
        "password": "password"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "Employee"

# Parametrize 20 failure cases for authentication
@pytest.mark.parametrize("username, password, expected_status", [
    ("agent1", "wrongpassword", 401),
    ("ghost", "password", 401),
    ("", "password", 422), # Validation error for empty username
    ("agent1", "", 422),   # Validation error for empty password
    ("admin' OR '1'='1", "password", 401), # SQLi attempt
    ("<script>alert(1)</script>", "password", 401), # XSS attempt
    ("A"*256, "password", 401), # Max length exceed
    ("user@name", "pass", 401), # Special chars
    ("agent1 ", "password", 401), # Trailing space
    (" agent1", "password", 401), # Leading space
    ("agent1", "password ", 401), # Password space
    ("NULL", "NULL", 401),
    ("admin\\", "pass", 401),
    ("Drop table users;", "pass", 401),
    ("a\nb", "pass", 401),
    ("agent1", "12345678901234567890123456789012345678901234567890", 401),
    ("a", "b", 401),
    (" ", " ", 401),
    ("\t", "pass", 401),
    ("agent1", "\n", 401)
])
@pytest.mark.asyncio
async def test_login_failures(async_client: AsyncClient, username, password, expected_status):
    response = await async_client.post("/api/auth/login", data={
        "username": username,
        "password": password
    })
    assert response.status_code == expected_status
