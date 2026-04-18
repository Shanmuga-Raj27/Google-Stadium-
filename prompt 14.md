# TASK: Fix MissingGreenlet Error in Auth Router

**Role:** Senior Backend Developer
**Context:** The `POST /auth/register` endpoint is crashing with a `MissingGreenlet` error. Pydantic is attempting to serialize `response.vendor_profile.menu_items` on the newly created user, but the lazy-loaded relationship has not been fetched in the async context.

**Execution Instructions:**

1. **Update `app/routers/auth.py`:**
   * Locate the `register` endpoint.
   * After the new User (and VendorProfile, if applicable) is added, committed, and refreshed (`db.commit()`), you must **re-query** the user from the database using eager loading before returning it.
   * Add the following imports if missing: `from sqlalchemy.orm import selectinload`
   * Execute a query like this before returning the user:
     ```python
     stmt = select(User).where(User.id == new_user.id).options(
         selectinload(User.vendor_profile).selectinload(VendorProfile.menu_items)
     )
     result = await db.execute(stmt)
     new_user_loaded = result.scalar_one()
     return new_user_loaded
     ```
2. **Safety Check:** Ensure that any other routes that return a User or Vendor explicitly use `selectinload` for nested relationships to prevent further `MissingGreenlet` serialization crashes. Do not alter the actual JWT login logic.