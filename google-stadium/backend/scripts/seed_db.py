import asyncio
import sys
import os

# Ensure the app module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.future import select
from app.database import AsyncSessionLocal
# The prompt mentioned importing User and Vendor models, but Vendor is implemented as a role on User
from app.models import User, RoleEnum

async def seed():
    async with AsyncSessionLocal() as session:
        # Check if User ID 1 exists
        result_fan = await session.execute(select(User).where(User.id == 1))
        if result_fan.scalar_one_or_none() is None:
            fan = User(id=1, username="dummy_fan", role=RoleEnum.fan)
            session.add(fan)
            print("Added dummy Fan (ID 1)")
        else:
            print("User ID 1 already exists")

        # Check if Vendor ID 2 exists
        result_vendor = await session.execute(select(User).where(User.id == 2))
        if result_vendor.scalar_one_or_none() is None:
            vendor = User(id=2, username="dummy_vendor", role=RoleEnum.vendor)
            session.add(vendor)
            print("Added dummy Vendor (ID 2)")
        else:
            print("Vendor ID 2 already exists")

        await session.commit()
        print("Seed completed.")

if __name__ == "__main__":
    asyncio.run(seed())
