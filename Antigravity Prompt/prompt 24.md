# TASK: Eradicate Axios Hangs & Implement Native Fetch Auth

**Role:** Senior Full-Stack Debugger
**Context:** The frontend `axios.post` call for authentication is hanging infinitely between Step 3 and Step 4 without rejecting, and the backend receives no request. This indicates a poisoned Axios interceptor or configuration swallowing the promise. We must bypass Axios entirely for the auth routes using native browser `fetch`.

**Execution Instructions:**

### 1. Rewrite Auth Forms with Native `fetch`
* Open `Login.jsx` and `Register.jsx`.
* Completely remove `axios` from the `handleSubmit` functions.
* Replace the API calls with the native `fetch` API. 
* **Register.jsx Example:**
  ```javascript
  console.log("[AUTH] Step 3: Sending native fetch to [http://127.0.0.1:8000/auth/register](http://127.0.0.1:8000/auth/register)");
  const response = await fetch("[http://127.0.0.1:8000/auth/register](http://127.0.0.1:8000/auth/register)", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password, role }) // adjust fields as needed
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  console.log("[AUTH] Step 4: Response received!");

  Login.jsx Example (Must use URLSearchParams):

JavaScript
const params = new URLSearchParams();
params.append('username', username);
params.append('password', password);

console.log("[AUTH] Step 3: Sending native fetch to [http://127.0.0.1:8000/auth/login](http://127.0.0.1:8000/auth/login)");
const response = await fetch("[http://127.0.0.1:8000/auth/login](http://127.0.0.1:8000/auth/login)", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: params
});

if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
}
const data = await response.json();
localStorage.setItem("token", data.access_token);
console.log("[AUTH] Step 4: Token saved!");
2. Backend Tracer Logs (FastAPI)
Open routers/auth.py in the backend.

Add explicit Python print() statements at the very beginning of the /login and /register endpoints to verify if the request actually reaches the Python server.

Example:

Python
@router.post("/register")
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    print(f">>> [BACKEND] RECEIVED REGISTER REQUEST FOR: {user.username}")
    # ... rest of code
Constraints: Maintain all existing Google Material UI formatting and error state handling. Ensure setIsLoading(false) is still explicitly called in the finally block.


### What to do after Antigravity applies this:
Try to log in or register again. By using `fetch`, the browser is forced to send the packet. 
1. If your frontend console hits `Step 4`, the bug is squashed and you are in!
2. If it still hangs, look at your Python terminal. If you see `>>> [BACKEND] RECEIVED REGISTER REQUEST` print out, it means your Python database logic is deadlocked and we know exactly where to fix it next. 

Let me know what happens!