# MISSION: Google Stadium v2 - Logistics, Financials, and Smart Cart

**Role:** Senior Full-Stack Architect
**Context:** We are upgrading the platform to handle real-world stadium logistics. This sprint introduces a Smart Cart with tiered promotional logic, Delivery vs. Pickup routing, a colorful interactive Stadium Map, a Vendor Financial Wallet, and custom Vendor-to-Fan notifications.

**CRITICAL RULE:** Maintain the strict WebSocket closure pattern `if (ws.readyState === 1) ws.close();` and the `selectinload` SQLAlchemy eager-loading fixes from our previous sprints. Do NOT break existing real-time chat or order states.

**Execution Checklist:**

### PHASE 1: Backend Architecture & Business Logic (FastAPI)
1. **Update `Order` Model & Schemas:**
   * Change all currency representations to Indian Rupees (₹).
   * Add `delivery_method` (String/Enum: 'pickup' or 'seat_delivery').
   * Add financial columns: `subtotal` (Float), `delivery_fee` (Float), `discount` (Float), `total_price` (Float).
   * Add `vendor_message` (String, nullable) for custom delivery instructions.
   * Add `freebies` (JSON/Array of strings) to store earned rewards.
2. **The "Smart Cart" Engine (Backend Pricing):**
   * In `routers/orders.py`, when a new order is posted, calculate the exact totals on the backend. DO NOT trust frontend pricing.
   * **Base Logic:** Default delivery_fee is ₹60 for 'seat_delivery' and ₹0 for 'pickup'.
   * **Tiered Promotional Rules (Apply based on `subtotal`):**
     * `> ₹500`: `delivery_fee = 0`, `freebies = ["Water Bottle", "Snacks"]`
     * `> ₹200`: `delivery_fee = 30` (Reduced), `freebies = ["Water Bottle", "Snacks"]`
     * `> ₹150`: `freebies = ["Water Bottle", "Snacks"]`
     * `> ₹100`: `freebies = ["Water Bottle"]`
3. **Wallet & Analytics Endpoints:**
   * Create `GET /vendors/{vendor_id}/wallet` to aggregate historical data: Total Sales (₹), Total Orders, and a list of completed orders (Order History).

### PHASE 2: Fan Experience Overhaul (React)
1. **Global Formatting:**
   * Do a global find-and-replace in the UI to change `$` to `₹`.
2. **Checkout/Order UI Update:**
   * Add a toggle for "Pickup (Default)" vs. "Seat Delivery (Premium +₹60)".
   * Display the dynamically calculated `total_price` and a celebratory banner if they earn `freebies` (e.g., "🎉 You earned a Free Water Bottle!").
3. **Live Stadium Map (`StadiumMap.jsx`):**
   * Create a new route and dedicated page for the Stadium Map, accessible via the Sidebar.
   * Use Tailwind CSS Grid to build a colorful, mini interactive map. 
   * Color code areas: Gates 1-4 (Green), Blocks A-D (Blue), Restrooms (Yellow), Vendor Stalls (Orange). 
   * Add a pulsing "Live Location" dot (simulated) to show where the user is relative to their selected vendor.
4. **Order Tracking Enhancements:**
   * Display the `vendor_message` in the Fan's order tracker when the status updates to 'ready' or 'delivered' (e.g., "Message from Vendor: Pickup food at Block A nearest stall").

### PHASE 3: Vendor Dashboard & Financials (React)
1. **Custom Notifications:**
   * On the active orders board, when a Vendor clicks "Mark as Ready", open a small inline input or modal. 
   * Allow the vendor to type a custom `vendor_message` (or provide quick-select templates like "Ready at Counter 2" or "Out for delivery"). Send this in the `PUT` request to update the order.
2. **Vendor Wallet & History (`VendorWallet.jsx`):**
   * Create a new page/tab for the Vendor to view their financials.
   * Build a beautiful KPI dashboard (using Google Material design) showing: Total Revenue (₹), Pending Orders, Completed Orders.
   * Render a clean data table below the KPIs showing the Customer Order History (Date, Fan Name, Items, Total Paid).

**Constraints:** Ensure responsive design (Mobile-First). Use standard Material font weights and clean borders. Ensure database migrations/resets account for the new Order columns before running.