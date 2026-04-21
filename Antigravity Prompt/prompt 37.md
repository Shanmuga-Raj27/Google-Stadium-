# MISSION: Apply Hybrid Loading State to Google OAuth

**Role:** Senior Frontend Engineer
**Context:** We successfully added `react-hot-toast` and an `isLoading` state to our standard auth buttons. However, the `<GoogleLogin>` component from `@react-oauth/google` does not trigger this loading state while waiting for the FastAPI backend to verify the token.

**CRITICAL DIRECTIVES:**
* **Non-Destructive:** Do not break the existing Google OAuth token extraction.
* **Target:** `frontend/src/Login.jsx` (and `Register.jsx`).

### Execution Steps:
1. **Locate the Google Success Callback:** Find the `<GoogleLogin onSuccess={...} />` component.
2. **Inject the Toast (Idea A):** Inside the `onSuccess` function, *before* the `fetch/axios` request is sent to our backend, add:
   `setIsLoading(true);`
   `toast.loading("Verifying Google account... waking up servers 🏟️", { id: "google-cold-start" });`
3. **Promise Resolution:** Inside the API call to our backend (`/auth/google`), wrap the logic in a standard `try/catch/finally`:
   - On success: `toast.success("Google Sign-In Successful!", { id: "google-cold-start" });`
   - On error: `toast.error("Google Sign-In failed.", { id: "google-cold-start" });`
   - In `finally`: `setIsLoading(false);`
4. **Hide Google Button During Load (Idea B):** Because we cannot easily change the text inside the official Google iframe button, we will conditionally hide it. 
   - Wrap the `<GoogleLogin />` component in a conditional render.
   - If `isLoading` is true, render a standard `<div>` with a spinner and the text "Authenticating with Google...".
   - If `isLoading` is false, render the `<GoogleLogin />` component.