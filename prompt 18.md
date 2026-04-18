# MISSION: Google Stadium v3 - Secure SaaS Map Builder & Mobile UI

**Role:** Principal SaaS Architect & Mobile UI Expert
**Context:** We are implementing a dynamic, database-driven "Stadium Map Builder" for Admins and a "Live Map Viewer" for Fans/Vendors. The codebase must be highly readable, secure against malformed payloads, and heavily optimized for mobile devices (touch-friendly drag-and-drop, Google Material Design 3 guidelines). 

**Execution Checklist:**

### PHASE 1: Secure Backend Infrastructure (FastAPI)
1. **The JSON Map Database & Validation:**
   * Create a `stadium_layouts` table: `id` (Integer), `name` (String), `layout_data` (JSONB).
   * **Security:** Create a strict Pydantic schema (`LayoutItemSchema`) to validate the incoming JSON array (must contain `id`, `type`, `label`, `x`, `y`). Reject malformed payloads.
   * Create `GET /stadium/layout` and `POST /stadium/layout`. Secure the `POST` route to ensure ONLY Admin roles can overwrite the map.
2. **Vendor Order Persistence:**
   * Create `GET /orders/vendor/{vendor_id}/active`. Return all orders where `status` is NOT 'delivered' or 'cancelled' to fix state-loss on refresh.

### PHASE 2: Mobile-First Admin Map Builder (`AdminMapBuilder.jsx`)
1. **Responsive Canvas & Toolbox:**
   * **Desktop:** Render a left-side toolbox and a large central canvas.
   * **Mobile:** Render a horizontal, scrollable "Bottom Sheet" or top toolbar for the toolbox to maximize canvas screen real estate.
2. **Touch-Safe Drag & Drop:**
   * Implement a React state array: `[{ id, type, label, x, y, color }]`.
   * **Crucial:** Use touch-compatible event listeners (`onTouchStart`, `onTouchMove`, `onTouchEnd`) alongside standard mouse events so the Admin can drag items using a smartphone.
   * When an item is added from the toolbox, place it at `{x: 50, y: 50}`. Allow clicking an item to edit its `label` text.
3. **Save Function:** POST the validated state array to `/stadium/layout`. Use a Google-style floating action button (FAB) for "Save Map".

### PHASE 3: Responsive Fan Viewer & Live Tracking (`StadiumMap.jsx`)
1. **Dynamic Rendering:**
   * Fetch the JSON layout from `GET /stadium/layout`. Map the array to render read-only shapes inside an auto-scaling container.
2. **Live Swiggy-Style Tracking Overlay:**
   * Match the Fan's location (`activeOrder.block`) and Vendor's location to the `label`s in the fetched JSON data to find their exact `x, y` coordinates.
   * Render a pulsing Blue dot (Fan) and an Orange dot (Vendor) at those exact coordinates.
   * Draw an animated SVG `<line>` connecting the two coordinates for live route visualization.

### PHASE 4: Global Bug Fixes & Code Quality
1. **Vendor Dashboard Refresh Fix:**
   * Inside `VendorDashboard.jsx` `useEffect`, explicitly `fetch()` the active orders endpoint *before* the WebSocket connects. Set this to state to ensure persistence.
2. **Strict WebSocket Cleanup:**
   * Fix the React StrictMode `Cannot read properties of null` warning globally.
   * Force this exact closure pattern: `return () => { if (ws.readyState === 1) ws.close(); };`

**Design & Code Constraints:** * **UI/UX:** Strictly adhere to Google Material Design. Use `rounded-2xl` for cards, soft shadows (`shadow-md`), and ensure all interactive touch targets are a minimum of `48px` by `48px`. 
* **Typography:** Do not use overly bold or neon fonts. Stick to clean, readable sans-serif standard weights.
* **Code Quality:** Add concise, professional comments above complex logic (especially the drag-and-drop coordinate math and Pydantic validators).