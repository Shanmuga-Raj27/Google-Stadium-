# MISSION: Hackathon Score Optimization (Non-Destructive)

**Role:** Principal QA Engineer & Accessibility Expert
**Context:** The application is currently LIVE in production. Our goal is to fix three specific scorecard gaps (Testing, Accessibility, Google Services) WITHOUT altering or breaking any of the existing core business logic, database schemas, or custom JWT authentication. 

**CRITICAL DIRECTIVES:** * **DO NOT** delete or modify the existing email/password login system.
* **DO NOT** change the Tailwind layout or visual design.
* **DO NOT** alter the WebSocket configuration.
* All additions must be strictly additive and isolated.

Execute the following three phases:

### PHASE 1: Accessibility (A11y) Injection
**Target:** React Frontend (`.jsx` files)
1. Scan `Login.jsx`, `Register.jsx`, `FanDashboard.jsx`, and `VendorDashboard.jsx`.
2. Inject `aria-label` attributes into every `<button>` and `<a>` tag.
3. Ensure every `<img>` tag has a descriptive `alt` attribute.
4. Ensure form inputs (`<input>`) have explicitly associated `<label>` tags or `aria-label` attributes.
*Constraint:* Make ZERO changes to the `className` strings. Do not touch the styling.

### PHASE 2: Automated Testing Baseline
**Target:** Frontend and Backend testing setups.
1. **Backend:** Create a new file `backend/tests/test_main.py`. Use `pytest` and `FastAPI TestClient` to write 3 simple tests: 
   - A test for a standard `GET` health-check or root endpoint.
   - A test to ensure `/auth/login` returns a 400/401 status code when given invalid credentials.
2. **Frontend:** Create a new file `frontend/src/App.test.jsx`. Write a simple test to verify that the main App component renders without crashing.
*Constraint:* Do not modify any production code to make the tests pass. The tests must conform to the existing code.

### PHASE 3: Google Services Integration (OAuth)
**Target:** Auth flow (Additive only).
1. **Frontend:** In the `Login.jsx` and `Register.jsx` files, add a "Sign in with Google" button below the existing custom login form. Use the standard Google Identity Services HTML/JS snippet or `@react-oauth/google` library. 
2. **Backend:** Add a new single endpoint in your auth router (e.g., `@router.post("/auth/google")`). This endpoint must accept a Google token, verify it, and then issue the **exact same internal JWT token format** your custom auth uses. 
*Constraint:* If the Google login fails, it must fail gracefully without crashing the frontend. The standard email/password login must remain the primary, untouched system.