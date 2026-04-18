# MISSION: Google Stadium v2 - Authentication & Swiggy-Style Dashboards

**Role:** Senior Full-Stack Architect
**Context:** We are upgrading "Google Stadium" to v2. The core tech stack remains FastAPI (Backend), asyncpg (PostgreSQL), and React + Vite + TailwindCSS (Frontend). 

**Immediate Fixes Required:**
1. Fix the React `StrictMode` WebSocket bug in `frontend/src/services/websocket.js` or the components using it. Ensure the `useEffect` hook properly returns a cleanup function that closes the WebSocket connection to prevent "closed before established" crashes.
2. Remove the temporary "Ping A" and "Ping B" testing buttons from the frontend UI.

---

## EXECUTION PHASES
Execute sequentially. Do not skip phases. Ensure all code is modular, well-commented, and readable.

### PHASE 1: Backend Security & Schema Expansion (FastAPI)
1. **Update `app/models.py` and `app/schemas.py`:**
   * **Users:** Expand to include `email`, `hashed_password`, and `role` (enum: 'admin', 'vendor', 'fan').
   * **Vendors:** Create a linked table (or columns) for `store_name` and `is_open`.
   * **Menu_Items:** Link to Vendors. Include `name`, `description`, `price`, and `icon` (string type to hold emojis).
   * **Orders:** Update to handle relations to Users and Menu_Items cleanly.
2. **Implement JWT Authentication:**
   * Install `passlib`, `bcrypt`, and `python-jose` via `uv`.
   * Create `app/utils/security.py` to handle password hashing and JWT token generation.
   * Create `app/routers/auth.py` with `/register` and `/login` endpoints. The login must return a standard `access_token`.
3. **Protect Routes:** Update existing backend routes to require a valid JWT token using FastAPI's `Depends(get_current_user)`.

### PHASE 2: Frontend Auth & Protected Routing (React)
1. **State Management:** Implement a simple Auth Context or Zustand store to hold the JWT token and the current user's role globally.
2. **Auth Pages:** Build clean, modern UI components for `/login` and `/register`.
3. **Protected Routes:** Create a `ProtectedRoute` wrapper component. 
   * If a user goes to `/vendor-dashboard` but has a 'fan' role, redirect them to `/fan-dashboard`.
   * If not logged in, redirect to `/login`.

### PHASE 3: The "Swiggy-Style" Dashboards (Tailwind UI)
Build these out using modern, clean Tailwind CSS. **CRITICAL: For all food images, use a simple text field that accepts Emojis (e.g., 🍔, 🍕, 🌭). Do NOT implement file uploads yet.**

1. **Fan Dashboard (`/fan-dashboard`):**
   * **Top Bar:** Display stadium gate statuses horizontally.
   * **Vendor Grid:** Display available vendors.
   * **Menu View:** When a vendor is clicked, show a Swiggy-style list of `Menu_Items` displaying the emoji icon large on the left, details on the right, and an "Add to Cart" / "Order" button.
   * **Live Tracker:** Keep the WebSocket listener active to show live push notifications when an order is ready.
2. **Vendor Dashboard (`/vendor-dashboard`):**
   * **Menu Manager:** A UI to create/edit `Menu_Items` (input name, price, and pick an emoji).
   * **Order Queue:** A live-updating board of incoming orders with a button to mark them "Ready".
3. **Admin Dashboard (`/admin-dashboard`):**
   * A master table view to see all registered Users and Vendors.
   * Basic toggle controls to manage global stadium statuses (e.g., Gate congestion).

**Constraint Checklist for AI Execution:**
- [ ] Is password hashing (bcrypt) and JWT implemented securely?
- [ ] Are WebSockets properly cleaned up on unmount?
- [ ] Is the frontend strictly using Emojis for food imagery instead of file inputs?
- [ ] Are frontend routes properly guarded based on user roles?

Begin execution at Phase 1.