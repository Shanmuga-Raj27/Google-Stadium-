
# TASK: Create Database Seed Script

**Role:** Senior Backend Developer
**Target File:** `backend/scripts/seed_db.py`
**Tech Stack:** Python, SQLAlchemy 2.0, asyncpg

**Instructions:**
Write a standalone asynchronous Python script to "seed" the PostgreSQL database with initial test data.

**Requirements:**
1. Import the `async_sessionmaker` from our `app.database` file.
2. Import the `User` and `Vendor` models from our `app.models` file.
3. Write an asynchronous function that opens a database session.
4. Safely check if User ID 1 and Vendor ID 2 already exist. If they do not, insert a dummy Fan (User ID 1) and a dummy Vendor (Vendor ID 2) using standard SQLAlchemy ORM methods.
5. Commit the session.
6. Include a standard `if __name__ == "__main__":` block to run the async function using `asyncio.run()`.