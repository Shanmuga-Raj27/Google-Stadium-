# MISSION: Google Stadium v2 - Admin Routing, Live Sync & Chat Overhaul

**Role:** Senior Full-Stack Architect & UI/UX Designer
**Context:** We need to finalize the Admin UI by moving Gate Controls to a separate page, syncing those live Gate updates to the Fan Dashboard, fixing several critical bugs in the Global Chat (double messages, incorrect roles), and applying strict Google Material styling to the chat bubbles. Finally, we must patch a lingering React StrictMode WebSocket crash.

**Execution Checklist:**

### PHASE 1: Emergency WebSocket Stability
1. **Fix `websocket.js` / Chat Hooks:** * The app is crashing with `Cannot read properties of null (reading 'close') at ws.onopen`. 
   * Inside all WebSocket event listeners (`onopen`, `onmessage`, `onclose`), add a strict guard clause: `if (!ws || !ws.current) return;`. Ensure event targets are referenced safely.

### PHASE 2: Global Chat Fixes & Material UI
1. **Fix Double Messages & Role Bugs:**
   * **Double Message Fix:** The UI is echoing messages (showing "hello hello"). Ensure the frontend ONLY appends messages to the state when they are received from the server `onmessage` event, NOT optimistically on form submit.
   * **Role Identity Fix:** Ensure the backend `/ws/chat` endpoint accurately extracts the User's role and Username from their JWT token/DB record, rather than trusting the frontend payload. 
2. **Material Chat UI Overhaul:**
   * **Sender Meta:** Above each message, display the sender's identity in small, clean text: `Username (Role)`. For vendors, display `Username (Store Name)`.
   * **Border Styling:** Apply thin, colored borders to the chat bubbles based on the role. 
     * Admin: `border border-red-500`
     * Vendor: `border border-green-500`
     * Fan/User: `border border-blue-500`
   * **Typography:** Strictly use clean, standard Material fonts (e.g., `text-gray-900 dark:text-gray-100`, `font-normal`). NO neon colors, NO overly bold text inside the chat bubbles.

### PHASE 3: Admin Routing & Live Gate Sync
1. **Separate Admin Gate Page:**
   * Create a new route and component: `AdminGates.jsx` (e.g., `/admin-dashboard/gates`).
   * Remove the Gate controls from the main `AdminDashboard.jsx`.
   * Update the `SidebarLayout.jsx` menu to include a link to the "Gate Controls" page specifically for Admins.
2. **Live Gate Synchronization:**
   * **Backend:** Create a REST endpoint (e.g., `PUT /gates/{id}`) for the Admin to update gate status (Low, Medium, High traffic). Upon saving to the DB, use a WebSocket manager to broadcast `{"type": "GATE_UPDATE", "data": {...}}` to all connected Fans.
   * **Frontend (Fan Dashboard):** Ensure the Fan Dashboard listens for the `GATE_UPDATE` WebSocket event and dynamically updates the colors/status of Gate 1, Gate 2, Gate 3, and Gate 4 in React state without requiring a page refresh.

**Constraints:** Ensure all code is secure, clean, and highly readable. Do not break existing Order webhooks. Use standard Tailwind Material design principles.