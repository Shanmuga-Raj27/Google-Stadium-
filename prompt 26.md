# MISSION: Google Stadium v1.0 Final Release Candidate (Scope Adjustment)

**Role:** Principal Full-Stack Architect & Product Designer
**Context:** This is the final production sprint. We are retaining the `StadiumMap` as a static stadium viewer but completely removing the "Live Tracking" (animated delivery dots) logic from the fan experience to ensure absolute stability. We are also implementing secure Admin registration, Auto-Login on register, User Location Memory, a polished Landing Page, high-contrast Light Mode UI, and strict environment variable management.

**Execution Checklist:**

### PHASE 1: Security & Environment Variables
1. **Backend (`.env`):** Setup `.env` to store `SECRET_KEY`, `DATABASE_URL`, and a new `ADMIN_REGISTRATION_SECRET`. Ensure `models.py` or `database.py` correctly imports these.
2. **Frontend (`.env.local`):** Create `.env.local` to store `VITE_API_URL=http://127.0.0.1:8000`. Replace all hardcoded `http://127.0.0.1:8000` strings in API calls with `import.meta.env.VITE_API_URL`.

### PHASE 2: Backend Architecture Updates (FastAPI)
1. **Location Memory:** Add `default_block`, `default_row`, and `default_seat` (Strings, nullable) to the `User` database model. 
2. **Order Logic Update:** When `POST /orders` is called, update the current user's `default` location fields with the location provided in that order, so the database remembers where they sit.
3. **Secure Auto-Login Registration:** * Update the `POST /auth/register` endpoint.
   * If the requested role is `admin`, require an `admin_secret` in the payload. Check it against the environment `ADMIN_REGISTRATION_SECRET`. If it does not match, throw a `403 Forbidden`.
   * Upon successful user creation, immediately generate the `access_token` and return it in the JSON response alongside the user data.

### PHASE 3: Frontend Auth & Landing Page (React)
1. **The Landing Page (`LandingPage.jsx`):** * Create a beautiful, responsive landing page using Google Material standards. 
   * Include a Hero section with a headline, subheadline, and a "Get Started" CTA that routes to `/register`.
2. **Auth Overhaul (`Register.jsx`):**
   * If the user selects "Admin" from the role dropdown, conditionally render an extra `<input>` for the "Admin Access Code". Pass this in the JSON payload.
   * On successful registration, capture the `access_token` from the response, save it to `localStorage`, and instantly `Maps()` to their respective dashboard.

### PHASE 4: UI Polish & Tracking Removal
1. **Static Map Downgrade:** In `StadiumMap.jsx`, remove the `fanLocation`, `vendorLocation`, and `orderStatus` math. Remove the Orange delivery dot and the dashed line. The map should now strictly function as a beautiful static layout viewer. Remove any "LiveTracker" components.
2. **Location Auto-Fill:** In the Fan ordering UI (`FanDashboard.jsx`), fetch the user's profile on load. Pre-fill the Block, Row, and Seat input fields with their `default` location data so they don't have to type it every time.
3. **High-Contrast Light Mode UI:** Audit the global CSS and Tailwind classes across all dashboards. 
   * Ensure light mode fonts are highly readable (e.g., `text-gray-900`). 
   * Ensure standard cards have strong visible borders in light mode: `border border-gray-300 shadow-sm`.
   * Maintain the existing Dark Mode aesthetics.

**Constraints:** Maintain pristine, readable code. Ensure strict mobile-first responsiveness. Do not alter the CSS Grid/Flexbox layouts of the existing Fan and Vendor dashboards.