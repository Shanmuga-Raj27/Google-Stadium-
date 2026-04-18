# MISSION: Google Stadium v4 - Map-First UI & Simulated Delivery Tracking

**Role:** Principal React Architect & UI/UX Expert
**Context:** We are transforming the Fan Dashboard into a "Map-First" experience (similar to Uber/Swiggy). The SVG Map must become the fixed background, and the Vendor Menu will act as a sliding Bottom Sheet. We must also fix Fan order persistence on refresh and implement Status-Based Simulated Tracking for both Fans and Vendors.

**Execution Checklist:**

### PHASE 1: Secure Backend Persistence (FastAPI)
1. **The "Active Order" Endpoint:**
   * Create a new secure endpoint: `GET /orders/me/active`.
   * Extract the user from the JWT token (`current_user`). Query the `orders` table for the most recent order where `user_id == current_user.id` and `status` is NOT 'delivered' or 'cancelled'.
   * This guarantees a Fan never loses their tracking screen on a page refresh.

### PHASE 2: Map-First Fan UI (`FanDashboard.jsx`)
1. **Layout Overhaul:**
   * Remove the standard grid layout. The `StadiumMap` component must take up the entire screen height (`h-screen`, `fixed inset-0`).
   * **The Bottom Sheet Menu:** Wrap the existing Food Menu and Vendor Selection inside a generic Bottom Sheet container. 
     * *Tailwind Example:* `<div className="fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 z-50 max-h-[70vh] overflow-y-auto transition-transform">`
     * When an active order exists, minimize this sheet so the Fan can see the tracking map.
2. **Wake-Up Routine:**
   * On component mount (`useEffect`), `fetch()` the `GET /orders/me/active` endpoint *before* connecting to the WebSocket. Set the `activeOrder` state to persist the tracking UI.

### PHASE 3: Simulated Live Tracking Engine (`StadiumMap.jsx`)
1. **The Coordinate Math:**
   * The map must receive `fanLocation` (e.g., 'block-A') and `vendorLocation` (e.g., 'stall-1') as props.
   * Draw a dashed `<line>` between `MAP_COORDS[fanLocation]` and `MAP_COORDS[vendorLocation]`.
2. **Status-Based Animation (Option A):**
   * Accept the order `status` as a prop.
   * Calculate the `cx` and `cy` of the Orange Vendor Dot dynamically:
     * If `status === 'pending'` or `'preparing'`: Dot is at `vendorLocation`.
     * If `status === 'ready'`: Dot is exactly halfway between vendor and fan. Calculate midpoint: `x = (vendor.x + fan.x) / 2`. Use CSS `transition-all duration-1000` so it glides smoothly to the middle.
     * If `status === 'delivered'`: Dot is at `fanLocation`.

### PHASE 4: The Vendor Radar View (`VendorDashboard.jsx`)
1. **Two-Way Visibility:**
   * On the Vendor's active order cards, add a "View Live Map" button with a map icon.
   * Clicking this opens a modal or expands a section containing the EXACT same `StadiumMap` component.
   * Pass the Fan's block and the Vendor's stall coordinates to the map so the Vendor can see the visual route they need to take for delivery.

**Constraints & UI/UX Standards:**
* **Security:** Rely strictly on the JWT token for `/orders/me/active`. Do NOT pass `user_id` in the URL parameter for fetching personal orders.
* **Mobile-First Design:** The Bottom Sheet is a critical mobile pattern. Ensure a small "drag handle" (a rounded gray pill `w-12 h-1.5 rounded-full mx-auto mb-4`) is rendered at the top of the Bottom Sheet to signify it can be swiped/clicked.
* **Code Quality:** Ensure all WebSockets maintain the strict `if (ws.readyState === 1) ws.close();` cleanup.