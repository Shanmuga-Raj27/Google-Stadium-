# MISSION: Global Codebase Audit & Environment Variable Enforcement

**Role:** Principal Frontend Security Engineer & DevOps Architect
**Context:** During the last deployment update, literal strings like `"VITE_API_URL=http://127.0.0.1:8000"` were erroneously hardcoded directly into the JavaScript `fetch` calls. This breaks production routing. 
**CRITICAL DIRECTIVE:** You must scan the entire frontend codebase. You are STRICTLY FORBIDDEN from hardcoding `http://127.0.0.1:8000` or the string `"VITE_API_URL="` inside any functional logic. All API calls must dynamically read from the Vite build environment.

**Execution Checklist:**

### PHASE 1: Codebase Audit & Cleanup
1. **Target Files:** Scan `Register.jsx`, `Login.jsx` (or your Auth component), `FanDashboard.jsx`, `VendorDashboard.jsx`, `ChatWidget.jsx`, and `websocket.js`.
2. **Eradicate:** Locate any `fetch()` or `WebSocket()` calls. Delete any instance where the URL is hardcoded as `http://127.0.0.1:8000` or mangled as `"VITE_API_URL=http://127.0.0.1:8000..."`.

### PHASE 2: Implement Dynamic URL Logic (The Fix)
1. **Standardize API Base URL:**
   Before any `fetch` call, you must define the `apiUrl` using standard Vite syntax with a secure production fallback. 
   **Use exactly this pattern:**
   ```javascript
   const apiUrl = import.meta.env.VITE_API_URL || "[https://google-stadium-backend.onrender.com](https://google-stadium-backend.onrender.com)";

   Standardize Fetch Calls:
Update the fetch endpoints to use template literals.
Example:

JavaScript
fetch(`${apiUrl}/auth/login`, { ... })
PHASE 3: WebSocket Protocol Security
Standardize WebSocket Base URL:
WebSocket connections must dynamically convert the apiUrl protocol (http -> ws, https -> wss).
Use exactly this pattern:

JavaScript
const apiUrl = import.meta.env.VITE_API_URL || "[https://google-stadium-backend.onrender.com](https://google-stadium-backend.onrender.com)";
const wsBase = apiUrl.replace(/^http/, 'ws');
const ws = new WebSocket(`${wsBase}/ws/orders/${userId}`);
Constraints: * Do NOT create or modify any .env files in this prompt. Focus entirely on the React .jsx and .js files.

Do NOT alter any UI, CSS, or business logic.

ONLY update how the URLs are constructed and passed to fetch and WebSocket.


### What happens next:
Once Antigravity runs this, it will surgically remove that nasty typo and insert the correct `import.meta.env` logic. 

After it finishes, run your standard terminal commands:
```bash
git add .
git commit -m "Fix API URLs and environment variables"
git push
Render will automatically detect this push, rebuild the frontend, and the [AUTH] error will finally be gone! Let me know when the build finishes!