import asyncio
import sys
import os

# Add the parent directory to sys.path to allow 'app' imports when running standalone
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
# Import all models to ensure they are registered with Base.metadata
from app.models import User, VendorProfile, MenuItem, Order, LocationPing, StadiumLayout

async def reset_database():
    print("Starting database schema reset...")
    async with engine.begin() as conn:
        print("Dropping existing tables...")
        await conn.run_sync(Base.metadata.drop_all)
        print("Creating new tables based on models...")
        await conn.run_sync(Base.metadata.create_all)
    print("Database reset completed successfully!")

if __name__ == "__main__":
    asyncio.run(reset_database())
