import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.backend.database import engine, Base
from src.backend import models

async def reset():
    print("Connecting to DB...")
    async with engine.begin() as conn:
        print("Dropping tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating tables...")
        await conn.run_sync(Base.metadata.create_all)
    print("Done!")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset())
