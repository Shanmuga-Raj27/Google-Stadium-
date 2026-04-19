# MISSION: Separate Live Tracking Page (Option A) & Zero-Touch Dashboard Integration

**Role:** Ultra-Conservative Senior React & FastAPI Architect
**Context:** We are implementing "Option A" (Status-based Simulated Tracking) to solve the Fan refresh memory loss and visualize delivery. 
**CRITICAL SAFETY DIRECTIVE:** You are STRICTLY FORBIDDEN from altering the HTML layout, CSS, Flexbox, Grid, or wrappers of `FanDashboard.jsx` and `VendorDashboard.jsx`. The existing UI must remain 100% untouched. The Stadium Map must be implemented as a completely SEPARATE page/modal.

**Execution Checklist:**

### PHASE 1: Backend State Persistence (`routers/orders.py`)
1. **New Endpoint:** Create `GET /orders/me/active`.
2. **Logic:** Extract the user from the JWT token. Query the database to return the single most recent order for that user where `status` is NOT in `['delivered', 'cancelled']`.

### PHASE 2: The Standalone Tracking View (`LiveTracker.jsx` - NEW FILE)
1. **Create a new component:** `LiveTracker.jsx`. This will house the `<StadiumMap>` and be rendered as a full-screen overlay or dedicated route.
2. **UI Design:** Use Google Material Design (mobile-first). Include a "Back to Dashboard" button at the top left. The map should take up the rest of the screen.

### PHASE 3: The Map Logic Upgrades (`StadiumMap.jsx`)
1. **Props:** The component must accept `fanLocation` (string), `vendorLocation` (string), and `orderStatus` (string).
2. **Coordinate Dictionary:** Implement a hardcoded constant mapping your location labels to SVG X/Y coordinates. (e.g., `const COORDS = { "Block A": {x: 400, y: 150}, "Block B": {x: 650, y: 400}, "McDonalds": {x: 100, y: 100} };`).
3. **Simulated Option A Tracking:**
   * Do NOT delete the existing SVG paths.
   * Draw a dashed SVG `<line>` between the Vendor and Fan coordinates.
   * Render an Orange SVG `<circle>` (The Delivery Dot).
   * **Math:** If `orderStatus` is 'pending'/'preparing', position the dot at the Vendor. If 'ready', position it exactly at the midpoint `(x1+x2)/2, (y1+y2)/2`. If 'delivered', position it at the Fan. Apply `transition-all duration-1000` to the circle's `cx` and `cy` for smooth movement.

### PHASE 4: Surgical Dashboard Integration (Minimal Touch)
1. **Fan Dashboard (`FanDashboard.jsx`):**
   * Add a `fetch` call to `GET /orders/me/active` inside the `useEffect` *before* the WebSocket connects. Set it to `activeOrder` state.
   * **Only UI Change allowed:** If `activeOrder` exists, render a single standard Google Material button: `<button>Track Live Order</button>`. When clicked, open the `LiveTracker` component. DO NOT wrap or alter any other elements.
2. **Vendor Dashboard (`VendorDashboard.jsx`):**
   * **Only UI Change allowed:** Inside the active orders list mapped items, add a button: `<button>View Route</button>`. When clicked, open the `LiveTracker` component passing the specific order's data.