# MISSION: Google Material UI Overhaul & Dashboard Refinement

**Role:** Senior UI/UX Engineer & React Specialist
**Context:** We are refining "Google Stadium v2". The current UI relies on overly bold/neon fonts. We need to transition to a clean, professional "Google Material" design language. Additionally, we need to restructure the global Menu/Sidebar, update the Gate logic across Fan and Admin dashboards, remove deprecated vendor options, and fix a lingering WebSocket StrictMode crash in the chat widget.

**Execution Checklist:**

### PHASE 1: WebSocket Stability (Emergency Fix)
1. **Fix `ChatWidget.jsx` and `websocket.js`:**
   * Audit the `useEffect` hooks managing WebSocket connections. 
   * Update the cleanup functions to strictly verify the WebSocket instance exists before closing. Example: `if (ws.current && ws.current.readyState === WebSocket.OPEN) { ws.current.close(); }`. Ensure no `.close()` calls are made on a `null` object.

### PHASE 2: Google UI & Global Layout Updates
1. **Typography & Colors:**
   * Audit all Tailwind classes across the frontend. 
   * Remove overly aggressive font weights (e.g., `font-extrabold`, `font-black`) and replace them with standard Material weights (`font-normal`, `font-medium`, `font-semibold`).
   * Ensure text colors contrast properly in both Light and Dark modes without looking neon.
2. **Global Menu Bar (`SidebarLayout.jsx`):**
   * Refactor the persistent left sidebar to be globally collapsible (minimize/maximize).
   * Add a toggle button (e.g., a Hamburger icon or Chevron) that switches the sidebar between a "fully expanded" state (showing icons + text) and a "minimized" state (showing only icons).

### PHASE 3: Dashboard Specific Refinements
1. **Fan Dashboard (`FanDashboard.jsx`):**
   * Remove all references to "Gate A, B, C". 
   * Replace them with "Gate 1", "Gate 2", "Gate 3", and "Gate 4".
2. **Admin Dashboard (`AdminDashboard.jsx`):**
   * Remove any old or deprecated gate control buttons.
   * Create a clean, modern control panel specifically for Gates 1, 2, 3, and 4.
   * Add controls for the Admin to update the live traffic status of each specific gate (e.g., "Set Gate 1 to Low Traffic", "Set Gate 2 to Very Crowded"). 
3. **Vendor Dashboard (`VendorDashboard.jsx`):**
   * Locate and permanently remove the "Switch Profile" option/button from the vendor view.

**Constraints:** Maintain the highest standard of clean, readable React code. Do not break the existing routing or order/chat WebSocket broadcasting logic. Ensure all conditional renders safely return a single parent fragment (`<></>`).