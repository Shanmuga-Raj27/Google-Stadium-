# MISSION: Fix Infinite Loading & Silent Failures in Auth Forms

**Role:** Senior React Debugger & UX Specialist
**Context:** The `Login.jsx` and `Register.jsx` components are getting stuck in an infinite "Loading..." state. The backend logs show no incoming requests, indicating the frontend is either failing before the network call or swallowing errors without resetting the loading state.

**Execution Instructions:**

### 1. Robust Try/Catch/Finally Blocks (`Login.jsx` & `Register.jsx`)
Rewrite the `handleSubmit` functions to strictly follow this architectural pattern to prevent infinite loading:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    // Ensure the URL is absolute if not using an Axios instance
    const response = await axios.post("http://localhost:8000/auth/login", formData);
    
    // Handle success (store token, navigate)
    localStorage.setItem("token", response.data.access_token);
    navigate("/target-dashboard");

  } catch (err) {
    // Visually expose the error to the user
    console.error("Auth Error:", err);
    setError(err.response?.data?.detail || "Network error or server is unreachable.");
  } finally {
    // CRITICAL: Always reset loading state regardless of success or failure
    setIsLoading(false);
  }
};

2. Form Validation & UX Improvements
Ensure the submit button acts dynamically: <button type="submit" disabled={isLoading}> {isLoading ? "Processing..." : "Login"} </button>.

Ensure the error state is rendered beautifully in the UI above the inputs (e.g., <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg">{error}</div>).

Verify that the payload being sent matches the exact structure expected by the FastAPI backend (e.g., OAuth2PasswordRequestForm requires username and password as form data, not a raw JSON body, if you used standard FastAPI auth. If using JSON, ensure the backend route expects a Pydantic model).

Constraints: Maintain the existing clean, mobile-first Google Material UI styling. Do not remove any existing form fields (like email/role in the register form).


Once this is applied, if the form fails again, it will immediately stop spinning and print the exact reason (like "Network Error") right on the screen. 

Are we ready to tackle rendering that new SVG stadium map once you successfully log