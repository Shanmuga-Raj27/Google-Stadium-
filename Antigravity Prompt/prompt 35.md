# MISSION: Clean up Google OAuth Logic

**Target:** `frontend/src/App.jsx` and `frontend/src/Register.jsx` (or wherever GoogleLogin is).

1. **In App.jsx:** Ensure `<GoogleOAuthProvider>` wraps the entire `<BrowserRouter>`. It should only appear ONCE in the entire project.
2. **In the Login/Register components:** Find the `<GoogleLogin />` component. 
   - Remove any `width="100%"` or `width="100%25"` prop.
   - Replace it with `width="250"` (use a number, not a percentage string).
3. **Double Check:** Ensure you are not manually calling `window.google.accounts.id.initialize` anywhere in a `useEffect`. Let the `@react-oauth/google` library handle it.