# MISSION: Google Stadium v2 - Real-Time Stabilization & Mobile-First UI

**Role:** Senior Full-Stack Architect & Mobile UI Expert
**Context:** The application suffers from real-time state desynchronization (Gates reset on refresh, orders fail to broadcast to vendors, chat echoes twice). Additionally, the UI must be rigorously updated to follow a "Mobile-First" Google Material design, ensuring seamless functionality on both phones and laptops.

**Execution Checklist:**

### PHASE 1: Real-Time Architecture Fixes (Backend & Frontend)
1. **Fix Gate State Persistence:**
   * **Backend:** Create a lightweight `GET /gates/status` REST endpoint that returns the current traffic state of Gates 1, 2, 3, and 4 from the database or memory cache.
   * **Frontend (`FanDashboard.jsx`):** On component mount, `fetch` this endpoint to set the initial gate state BEFORE relying on WebSocket updates.
2. **Fix Order Broadcasting:**
   * **Backend (`routers/orders.py`):** Verify that the `NEW_ORDER` WebSocket broadcast strictly targets the `vendor_id` associated with the order.
   * **Frontend (`VendorDashboard.jsx`):** Ensure the WebSocket connects securely to the vendor's specific channel and successfully parses the incoming `NEW_ORDER` JSON payload to update the `orders` state array.
3. **Fix Global Chat Echo & Admin Access:**
   * **Frontend (`ChatWidget.jsx`):** Remove any "optimistic" state updates. The `handleSendMessage` function should ONLY send the payload to the WebSocket. The UI must ONLY update when receiving a message via the `ws.onmessage` event.
   * **Backend:** Ensure Admin users can successfully connect to the `/ws/chat` channel and that their role is correctly validated and broadcasted.

### PHASE 2: React StrictMode WebSocket Fix
1. **Rewrite `websocket.js` / Hook Logic:**
   * Refactor the `useEffect` handling WebSockets to use a local block-scoped variable instead of relying solely on `useRef`, preventing `null` reference crashes on fast unmounts.
   * Example pattern: 
     ```javascript
     useEffect(() => {
       const ws = new WebSocket(url);
       ws.onmessage = ...
       return () => { if (ws.readyState === 1) ws.close(); }
     }, [])
     ```

### PHASE 3: Mobile-First Google Material UI
1. **Global Responsive Layout (`SidebarLayout.jsx`):**
   * Implement a Mobile-First layout using Tailwind. 
   * On mobile (`< md`), hide the sidebar entirely behind a Hamburger menu icon in a top sticky header. When clicked, slide the sidebar in as an overlay/drawer.
   * On desktop (`md:`), the sidebar should be persistently pinned to the left side.
2. **Dashboard Responsiveness:**
   * **Fan Dashboard:** Ensure the Swiggy-style menu grid uses `grid-cols-1` on mobile and `md:grid-cols-2 lg:grid-cols-3` on larger screens. Ensure food images/icons and text scale appropriately without overflowing.
   * **Admin Dashboard:** Ensure the new Gate Control panels stack cleanly vertically on mobile and horizontally on desktop. 
3. **Touch Targets & Spacing:**
   * Apply Google Material standard padding (`p-4`, `py-3`) to all buttons, chat inputs, and menu items to ensure they are easily clickable with a thumb on mobile devices. Ensure inputs don't cause horizontal scrolling.