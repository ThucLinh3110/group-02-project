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

@pytest.mark.asyncio
async def test_login_failure_wrong_password(async_client: AsyncClient):
    response = await async_client.post("/api/auth/login", data={
        "username": "agent1",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Tài khoản hoặc mật khẩu không đúng"

@pytest.mark.asyncio
async def test_login_failure_non_existent(async_client: AsyncClient):
    response = await async_client.post("/api/auth/login", data={
        "username": "ghost",
        "password": "password"
    })
    assert response.status_code == 401


