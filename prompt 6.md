# MISSION: Frontend Routing Fixes & Backend Eager Loading

**Role:** Senior Full-Stack Developer
**Context:** We are stabilizing "Google Stadium v2". The frontend has severe routing issues (base URL redirects to a blank fan dashboard), the Register UI is missing the Admin role for local testing, and the Fan Dashboard displays "0 items" for vendors due to backend SQLAlchemy lazy-loading.

**Execution Checklist:**

### PHASE 1: Frontend Routing & Auth Guard Fixes (React)
1. **Fix `App.jsx` Routing:**
   * Ensure the base route `<Route path="/" element={<Navigate to="/login" replace />} />` correctly redirects to the login page.
   * Add a catch-all route (`<Route path="*" element={...} />`) to handle unknown URLs cleanly.
2. **Fix Protected Routes (`ProtectedRoute.jsx` or similar):**
   * The current Auth Guard is failing, resulting in a blank black screen. Update the logic: If no user/token is found in the state, it **must** immediately return `<Navigate to="/login" replace />`. 
   * Do not attempt to render the dashboard components if the user object is null.
3. **Update `Register.jsx` UI:**
   * Modify the role selection dropdown (`<select>`) to explicitly include `<option value="admin">Admin</option>`. This is required for local development testing.

### PHASE 2: Backend Lazy-Loading Fix (FastAPI & SQLAlchemy)
1. **Fix `app/models.py`:**
   * Ensure the relationship between `VendorProfile` and `Menu_Items` uses `lazy="selectin"` (or `joinedload`) so menu items are eagerly loaded when vendors are queried.
2. **Fix `app/schemas.py`:**
   * Ensure the Pydantic schema used to return Vendors to the frontend (e.g., `VendorOut`) includes `menu_items: list[MenuItemOut] = []`. Make sure `from_attributes=True` is enabled.
3. **Fix `app/routers/vendors.py` (or relevant router):**
   * Update the `GET /vendors` query to explicitly use `.options(selectinload(VendorProfile.menu_items))` if not already handled by the model definition.

### PHASE 3: Frontend Menu Rendering
1. **Update `FanDashboard.jsx`:**
   * Now that the backend is eagerly loading the menu items, map through `vendor.menu_items` in the UI.
   * Display the `icon` (the emoji text field), `name`, and `price` for each food item under the respective vendor card.

**Constraints:** Ensure all React imports (`Maps`, `Route`, etc.) are correct to prevent white-screen crashes.