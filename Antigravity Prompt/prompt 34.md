# MISSION: Score Optimization Sprint (Efficiency & Testing)

**Role:** Senior Backend Engineer & SDET (Software Development Engineer in Test)
**Context:** The app is functional and Google OAuth is working. We need to boost the "Efficiency" and "Testing" scores for the final hackathon submission.

**CRITICAL SAFETY RULES:**
* **DO NOT** modify the UI, CSS, or Google OAuth logic.
* **DO NOT** change existing database schemas.
* **DO NOT** delete any existing features.
* Every change must be additive or a performance optimization.

### PHASE 1: Efficiency & Performance (Backend)
**Target:** `backend/app/`
1. **Async Optimization:** Review all FastAPI endpoints. Ensure they use `await` for all database calls and avoid any blocking `time.sleep()` or synchronous I/O.
2. **Database Connection Pooling:** Ensure the SQLAlchemy engine is configured with efficient pooling (e.g., `pool_size=10`, `max_overflow=20`) to handle high traffic from judges.
3. **Response Models:** Explicitly define `response_model` in all FastAPI decorators to speed up data serialization and improve the efficiency score.

### PHASE 2: Efficiency & Bundle Size (Frontend)
**Target:** `frontend/`
1. **Memoization:** Wrap heavy dashboard components or calculations in `React.memo` or `useMemo` to prevent unnecessary re-renders.
2. **Code Splitting:** If the app has multiple large pages, ensure we are using `React.lazy()` for route-based splitting to reduce the initial bundle size.

### PHASE 3: Deep Testing Coverage (The "Point Grabber")
**Target:** `tests/` folders
1. **Backend Integration Tests:** Create `backend/tests/test_api.py`. Write tests for:
   - User profile retrieval.
   - Menu item fetching.
   - Order placement logic (mock the database if necessary).
2. **Frontend Component Tests:** Create `frontend/src/Dashboard.test.jsx`. Write a test that mocks a successful API response and checks if the "Available Vendors" list renders correctly.
3. **Edge Case Testing:** Add a test that verifies the backend handles "404 Not Found" correctly when a user requests a non-existent order.

### PHASE 4: Final Documentation
1. Update `README.md` with a "Testing" section explaining how to run the tests (e.g., `pytest` and `npm test`). Automated graders love seeing this.