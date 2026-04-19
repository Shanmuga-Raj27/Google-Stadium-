# MISSION: Debug and Harden /auth/register Endpoint

**Role:** Senior Backend Developer & Debugger
**Context:** The `POST /auth/register` endpoint is throwing a `500 Internal Server Error` when called from the React frontend. CORS has been resolved, meaning the crash is happening during backend Python execution or database insertion.

**Task:** Audit and rewrite the registration logic in `app/routers/auth.py`, `app/schemas.py`, and `app/utils/security.py` to ensure it is crash-proof.

**Execution Checklist:**
1. **Pydantic vs. SQLAlchemy Mapping:** * Verify that the `UserCreate` Pydantic schema expects a raw `password` string.
   * Ensure that the `password` is removed/hashed before being passed to the SQLAlchemy `User` model, which should only receive `hashed_password`.
2. **Password Hashing Logic:** * Check `app/utils/security.py`. Ensure the `get_password_hash` function correctly handles string encoding and returns a valid string (not bytes) to store in the database.
3. **Database Integrity & Error Handling:** * In `app/routers/auth.py`, wrap the `db.add(new_user)` and `db.commit()` steps inside a `try...except` block.
   * Catch `sqlalchemy.exc.IntegrityError` (which occurs if an email already exists) and execute an `await db.rollback()`, then raise an `HTTPException(status_code=400, detail="Email already registered")`.
   * Catch any generic `Exception` and raise an `HTTPException(status_code=500, detail=str(e))` so the precise Python error is sent back to the client for easier debugging.

**Output:** Refactor the relevant files to meet these strict error-handling standards. Do not break the existing JWT login flow.