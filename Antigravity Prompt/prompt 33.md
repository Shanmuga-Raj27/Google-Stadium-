# MISSION: Final OAuth Code Surgery (Replace Mock with Real SDK)

**Context:** I have added the real `VITE_GOOGLE_CLIENT_ID` to my Render environment. Currently, the code is still showing a "Mock" message. I need to replace that with the real Google login flow.

**CRITICAL:** Do not touch the existing email/password login. This is additive.

### STEP 1: Frontend Implementation
**Target:** `Login.jsx` (and `Register.jsx`)
1. Remove the code that triggers the `alert()` or console message about "Google OAuth UI integration."
2. Import `GoogleLogin` from `@react-oauth/google`.
3. Implement the real `<GoogleLogin />` component using `import.meta.env.VITE_GOOGLE_CLIENT_ID`.
4. On `onSuccess`, send the `credential` to the backend: 
   `POST ${import.meta.env.VITE_API_URL}/auth/google`

### STEP 2: Backend Endpoint Creation
**Target:** `backend/app/routers/auth.py` (or your auth logic file)
1. Add a new route: `@router.post("/auth/google")`.
2. This route must accept the Google token, verify it (use `google-auth` library if available, or a simple fetch to Google's tokeninfo), and then issue a standard JWT token exactly like the email login does.
3. Ensure the backend doesn't crash if the Google user doesn't exist in the DB yet—create a new user entry for them!

### STEP 3: Dependency Check
1. Ensure `frontend/package.json` has `@react-oauth/google`.
2. Ensure `backend/requirements.txt` has `google-auth`.