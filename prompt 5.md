# TASK: Create Database Reset Script

**Role:** Senior Backend Developer
**Target File:** `backend/scripts/reset_db.py`
**Tech Stack:** Python, SQLAlchemy 2.0 (Async), asyncpg

**Context:** Our database schema is out of sync with our `models.py` because we added new columns (`email`, `hashed_password`, etc.). We need a utility script to drop and recreate all tables cleanly during local development.

**Instructions:**
Write a standalone asynchronous Python script that resets the database schema.

**Requirements:**
1. Import the `engine` and the declarative `Base` from `app.database`.
2. Import all models from `app.models` so they are registered with `Base.metadata`.
3. Write an `async def reset_database():` function.
4. Inside the function, use `async with engine.begin() as conn:` to open a connection.
5. First, execute `await conn.run_sync(Base.metadata.drop_all)` to wipe the old schema.
6. Next, execute `await conn.run_sync(Base.metadata.create_all)` to generate the new, updated schema based on the current models.
7. Include print statements indicating success.
8. Use `asyncio.run(reset_database())` in the `__main__` block to execute it.