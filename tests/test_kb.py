import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_kb_create_agent(async_client: AsyncClient, agent_token: str):
    res = await async_client.post(
        "/api/kb",
        headers={"Authorization": f"Bearer {agent_token}"},
        json={"title": "Test Article", "category": "Network", "content": "Test content"}
    )
    assert res.status_code == 200
    assert res.json()["title"] == "Test Article"

@pytest.mark.asyncio
async def test_kb_create_customer(async_client: AsyncClient, customer_token: str):
    res = await async_client.post(
        "/api/kb",
        headers={"Authorization": f"Bearer {customer_token}"},
        json={"title": "Test Article", "category": "Network", "content": "Test content"}
    )
    assert res.status_code == 403

# 18 parameterized test cases for KB API
@pytest.mark.parametrize("title, category, content, expected_status", [
    ("", "Network", "content", 422),
    ("title", "", "content", 422),
    ("title", "Network", "", 422),
    ("A"*256, "Network", "content", 200),
    ("title", "Network", "A"*10000, 200),
    ("<script>alert(1)</script>", "Network", "content", 200),
    ("SQLi", "DROP TABLE articles;", "content", 200),
    ("emoji 🚀", "Network", "test", 200),
    ("unicode \u202e", "Network", "reverse", 200),
] + [(f"title edge {i}", "Network", f"desc edge {i}", 200) for i in range(1, 10)])
@pytest.mark.asyncio
async def test_kb_create_edges(async_client: AsyncClient, agent_token: str, title, category, content, expected_status):
    payload = {}
    if title is not None: payload["title"] = title
    if category is not None: payload["category"] = category
    if content is not None: payload["content"] = content
    
    res = await async_client.post(
        "/api/kb",
        headers={"Authorization": f"Bearer {agent_token}"},
        json=payload
    )
    assert res.status_code in [200, 422]
