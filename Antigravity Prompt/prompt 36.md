# MISSION: Hybrid Cold-Start UX Implementation (Non-Destructive)

**Role:** Senior Frontend Engineer & UX Specialist
**Context:** Our FastAPI backend is deployed on Render's free tier and experiences a 30-50 second cold start. We need to implement a "Hybrid Loading State" (Idea A + Idea B) on the authentication forms to prevent user frustration and duplicate API calls.

**CRITICAL DIRECTIVES:**
* **Non-Destructive:** Do NOT alter the existing custom JWT API calls, database logic, or Google OAuth logic.
* **UI Consistency:** Maintain the existing Tailwind CSS layout and "Google Material" aesthetic. Must remain mobile-friendly.
* **Error Handling:** Ensure the loading state resets (`isLoading = false`) whether the API call succeeds OR fails.

Execute the following phases:

### PHASE 1: Dependency Management
**Target:** `frontend/`
1. Instruct the user to install the notification library: `npm install react-hot-toast`.
2. Do not modify `requirements.txt` (this is a frontend-only UX update).

### PHASE 2: Global Toast Setup
**Target:** `frontend/src/App.jsx`
1. Import `Toaster` from `react-hot-toast`.
2. Place the `<Toaster position="top-center" />` component at the root of the app, inside the main `<BrowserRouter>` or layout wrapper, ensuring it is visible on mobile screens.

### PHASE 3: Hybrid Loading Implementation
**Target:** `frontend/src/Login.jsx` and `frontend/src/Register.jsx`
1. **State:** Add a new state: `const [isLoading, setIsLoading] = useState(false);`
2. **Toast Trigger (Idea A):** Inside the `handleSubmit` function, immediately at the start of the execution, add:
   `setIsLoading(true);`
   `toast.loading("The app is loading, please wait 30 to 50 seconds... 🏟️", { id: "cold-start-toast" });`
3. **Promise Resolution:** Wrap the existing API call in a `try/catch/finally` block. 
   - On success: `toast.success("Welcome!", { id: "cold-start-toast" });`
   - On error: `toast.error("Login failed. Try again.", { id: "cold-start-toast" });`
   - In `finally`: `setIsLoading(false);`
4. **Button UI (Idea B):** Locate the main "Login" or "Register" submit `<button>`.
   - Add `disabled={isLoading}`.
   - Update Tailwind classes to visually dim the button when disabled (e.g., `disabled:opacity-70 disabled:cursor-not-allowed`).
   - Conditionally render the button text: If `isLoading` is true, show a small SVG loading spinner alongside the text "Connecting...". If false, show the normal text.