# MISSION: Production-Proofing for Render Deployment

**Role:** Senior DevOps & Full-Stack Architect
**Context:** We are preparing the "Google Stadium" application for production deployment on Render. We need to implement critical configuration changes to handle Render's PostgreSQL URL formatting, secure WebSockets (`wss://`), React SPA routing, and Python dependencies. 
**CRITICAL SAFETY DIRECTIVE:** Do NOT alter any business logic or UI components. Apply ONLY the configuration changes requested below.

**Execution Checklist:**

### PHASE 1: Backend Database URL Fix (`database.py`)
1. **The SQLAlchemy Trap:** Render provisions databases with `postgres://`, but modern SQLAlchemy strictly requires `postgresql://`.
2. **Action:** Locate the database initialization logic (likely in `database.py` or `models.py`). Inject the following safety check immediately after fetching `DATABASE_URL` from the environment:
   ```python
   import os
   DATABASE_URL = os.getenv("DATABASE_URL")

   # Render compatibility fix
   if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
       DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

PHASE 2: Frontend WebSocket Security
Dynamic Protocols: Hardcoded ws:// connections will fail under HTTPS in production.

Action: Audit FanDashboard.jsx (and any other files initializing WebSockets). Update the WebSocket URL construction to dynamically adapt to the environment:

JavaScript
const apiUrl = import.meta.env.VITE_API_URL || "[http://127.0.0.1:8000](http://127.0.0.1:8000)";
// Safely convert http to ws, and https to wss
const wsUrl = apiUrl.replace(/^http/, 'ws') + `/ws/orders/${userId}`; 
const ws = new WebSocket(wsUrl);
PHASE 3: React Router SPA Fix
The 404 Bug: Static hosting requires a fallback to index.html for client-side routing.

Action: Create a new file in the frontend/public/ directory named exactly _redirects (no file extension).

Content: Insert this exact single line of text:
/* /index.html   200

PHASE 4: Python Dependencies
Action: Ensure a requirements.txt exists in the backend root directory. If it does not exist, generate one containing the essential packages (e.g., fastapi, uvicorn, sqlalchemy, psycopg2-binary, pydantic, python-dotenv, websockets, pyjwt, passlib).
Note: Remind the user via console comment to run pip freeze > requirements.txt if they have custom packages installed locally.


### Next Steps:
Once Antigravity finishes:
1. Double-check that the `_redirects` file was placed inside the `public` folder, not the `src` folder. 
2. Open your terminal and run your Git save commands (`git add .`, `git commit -m "Production ready"`, `git push`).
3. Head over to Render and start your deployment!