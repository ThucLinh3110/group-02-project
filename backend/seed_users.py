import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from src.backend.database import engine, Base, AsyncSessionLocal
from src.backend.models import User, UserRole
from src.backend.routers.auth import get_password_hash

async def seed_users():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if admin exists
        from sqlalchemy.future import select
        result = await db.execute(select(User).where(User.username == "admin"))
        if not result.scalars().first():
            admin = User(
                username="admin",
                password_hash=get_password_hash("123456"),
                role=UserRole.AGENT,
                full_name="IT Admin"
            )
            db.add(admin)
        
        result2 = await db.execute(select(User).where(User.username == "nv01"))
        if not result2.scalars().first():
            nv = User(
                username="nv01",
                password_hash=get_password_hash("123456"),
                role=UserRole.EMPLOYEE,
                full_name="Nhân Viên 01"
            )
            db.add(nv)
            
        await db.commit()
        print("Đã tạo tài khoản mẫu: admin (123456), nv01 (123456)")

if __name__ == "__main__":
    asyncio.run(seed_users())
