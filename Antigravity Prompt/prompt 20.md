# MISSION: Secure & Bulletproof Auth Routing (Login/Register)

**Role:** Senior React Security Architect
**Context:** The Login and Register components are experiencing a "Silent Failure" where the submit buttons do not trigger the authentication logic and throw no console errors. The codebase requires a strict audit for event handler wiring, state management, and user feedback.

**Execution Checklist:**

### PHASE 1: React Form Architecture (`Login.jsx` & `Register.jsx`)
1. **Strict Event Wiring:**
   * Ensure the parent container is a `<form>` element, and attach the submission handler strictly to the form itself: `<form onSubmit={handleLogin}>`.
   * Ensure the submit button is explicitly typed: `<button type="submit">`.
   * The very first line of the submit handler MUST be `e.preventDefault();` to stop the browser from executing a ghost reload.
2. **Controlled Inputs:**
   * Ensure all inputs (`username`, `password`, `email`) are strictly controlled components mapped to `useState` with proper `onChange={(e) => setFieldValue(e.target.value)}` handlers.

### PHASE 2: State, Security, and UI Feedback
1. **Loading State:**
   * Implement an `isLoading` state boolean. 
   * When `handleSubmit` fires, set `isLoading(true)`. Disable the submit button visually and functionally while loading (e.g., `disabled={isLoading}`). Re-enable it in the `finally` block of the try/catch.
2. **Visible Error Handling:**
   * Implement an `error` state (String).
   * Do NOT just `console.error` failures. If the `try/catch` catches an error (like a 401 Unauthorized or 400 Bad Request), extract the error message from the Axios/Fetch response and set it to state: `setError(err.response?.data?.detail || "Authentication failed")`.
   * Render this error visibly above the form inputs using Tailwind: `<div className="text-red-500 text-sm font-medium mb-4">{error}</div>`.

### PHASE 3: Authentication API Integration
1. **Token Storage & Routing:**
   * Verify the `POST /auth/login` and `POST /auth/register` endpoints are being hit correctly.
   * Upon successful login, securely store the JWT token (e.g., `localStorage.setItem('token', data.access_token)`).
   * Ensure the `react-router-dom` `useNavigate` hook is utilized to push the user to their respective dashboard based on their role (`/fan-dashboard`, `/vendor-dashboard`, `/admin-dashboard`) immediately after token storage.

**Constraints & Code Quality:**
* Maintain strict Google Material UI aesthetics (clean padding, `rounded-xl`, readable fonts). Mobile-first responsiveness is mandatory.
* Ensure code is highly readable, modular, and well-commented. Remove any deprecated or unused imports.