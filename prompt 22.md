# TASK: Fix Auth Routing & FastAPI Payload Formatting

**Role:** Senior React API Integrator
**Context:** The Login and Register forms are suffering from a silent failure (infinite loading). The backend is receiving zero requests, indicating a Network/Port error or a misconfigured payload that is causing Axios to fail silently.

**Execution Instructions:**

### 1. Hardcode Absolute Backend URLs
* In both `Login.jsx` and `Register.jsx`, explicitly define the backend URL in your Axios or Fetch calls to guarantee it hits FastAPI.
* Use exactly: `http://localhost:8000/auth/login` and `http://localhost:8000/auth/register`. Do not rely on relative paths like `/auth/login`.

### 2. Fix FastAPI Payload Formatting (CRITICAL)
FastAPI strictly requires different payload types for Login vs Register. Update the API calls:
* **In `Register.jsx`:** Send the payload as standard JSON. 
  ```javascript
  const response = await axios.post("http://localhost:8000/auth/register", {
    username, email, password, role
  });

  In Login.jsx: FastAPI's OAuth2PasswordRequestForm STRICTLY requires application/x-www-form-urlencoded. You must format the payload using URLSearchParams:

JavaScript
const params = new URLSearchParams();
params.append('username', username);
params.append('password', password);

const response = await axios.post("http://localhost:8000/auth/login", params, {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
});
3. Fail-Safe Catch Block
If the server is unreachable (Network Error), err.response will be undefined, which is why the UI is failing silently. Update the catch block in both components to handle this safely:

JavaScript
} catch (err) {
  console.error("Auth Error:", err);
  // Handle Network Errors (no response) vs Backend Errors (400/401)
  const errorMessage = err.response?.data?.detail || err.message || "Unable to connect to the server.";
  setError(errorMessage);
} finally {
  setIsLoading(false);
}
Constraints: Maintain all existing Google Material UI formatting and form states. Ensure the user is navigated (useNavigate) to their respective dashboard (/fan-dashboard, /vendor-dashboard, /admin-dashboard) upon a successful 200 OK response from Login.


Once Antigravity applies this, the React app will successfully bridge the gap to the `localhost:8000` backend. You will finally be able to log in and see that awesome new Stadium Map!