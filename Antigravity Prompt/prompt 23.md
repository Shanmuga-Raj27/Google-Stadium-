# TASK: Fix Silent Auth Freeze & Apply Debug Tracers

**Role:** Senior React Debugger
**Context:** The Login and Register forms are suffering from a "Silent Freeze." The loading spinner activates, but no request reaches the backend and no error is thrown in the console. This strongly indicates an IPv4/IPv6 `localhost` resolution mismatch or a silent synchronous JS crash inside the try/catch block.

**Execution Instructions:**

### 1. Fix the IPv6 Localhost Trap
* Audit `Login.jsx`, `Register.jsx`, and any global API files (`api.js` or `axios.js`).
* Replace all instances of `http://localhost:8000` with explicit IPv4: `http://127.0.0.1:8000`. 
* Ensure trailing slashes match FastAPI exactly (use `/auth/login` and `/auth/register` without trailing slashes).

### 2. Implement Step-by-Step Debug Tracers
* Rewrite the `handleSubmit` functions in both Login and Register to include explicit console logs at every step. This guarantees we know exactly where the thread dies.
* **Force this exact structure for Login (adapt for Register):**

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("[AUTH] Step 1: Form submitted. Preventing default.");
  setError("");
  setIsLoading(true);

  try {
    console.log("[AUTH] Step 2: Preparing payload.");
    // FastAPI requires URLSearchParams for OAuth2
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    console.log("[AUTH] Step 3: Sending request to [http://127.0.0.1:8000/auth/login](http://127.0.0.1:8000/auth/login)");
    const response = await axios.post("[http://127.0.0.1:8000/auth/login](http://127.0.0.1:8000/auth/login)", params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    console.log("[AUTH] Step 4: Response received!", response.status);
    localStorage.setItem("token", response.data.access_token);
    
    console.log("[AUTH] Step 5: Navigating to dashboard...");
    // Add logic to route based on role if needed
    navigate("/target-dashboard");

  } catch (err) {
    console.error("[AUTH] ERROR CAUGHT:", err);
    // Bulletproof error extraction
    let errMsg = "Unable to connect to the server. Check backend.";
    if (err.response && err.response.data && err.response.data.detail) {
      errMsg = err.response.data.detail;
    } else if (err.message) {
      errMsg = err.message;
    }
    setError(errMsg);
  } finally {
    console.log("[AUTH] Step 6: Finally block running. Resetting loading state.");
    setIsLoading(false);
  }
};

Constraints: Maintain all Google UI styling. Ensure the codebase remains highly readable. Do not alter the actual HTML/JSX structure beyond ensuring the onSubmit is on the <form> tag.


### What to do next:
1. After Antigravity applies this, open your browser and press **F12** to open the Developer Tools Console.
2. Try to log in. 
3. Watch the console. You should see `[AUTH] Step 1`, `[AUTH] Step 2`, etc., print out in real-time. 

If it successfully prints `Step 4`, the `127.0.0.1` fix worked and you will be logge