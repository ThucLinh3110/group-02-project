import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.backend.database import Base, get_db
from src.backend.main import app
from src.backend.models import User
from src.backend.routers.auth import get_password_hash

SQLALCHEMY_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

TestingSessionLocal = async_sessionmaker(
    engine, expire_on_commit=False, class_=AsyncSession
)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(autouse=True)
async def prepare_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with TestingSessionLocal() as session:
        # Create test Agent
        agent = User(
            username="agent1",
            password_hash=get_password_hash("password"),
            role="Agent",
            full_name="Test Agent"
        )
        # Create test Customer
        customer = User(
            username="customer1",
            password_hash=get_password_hash("password"),
            role="Employee",
            full_name="Test Customer"
        )
        session.add_all([agent, customer])
        await session.commit()

    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest_asyncio.fixture
async def agent_token(async_client: AsyncClient):
    res = await async_client.post("/api/auth/login", data={"username": "agent1", "password": "password"})
    return res.json()["access_token"]

@pytest_asyncio.fixture
async def customer_token(async_client: AsyncClient):
    res = await async_client.post("/api/auth/login", data={"username": "customer1", "password": "password"})
    return res.json()["access_token"]
