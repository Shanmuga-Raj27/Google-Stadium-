# Sprint 17: Logistics, Financials & Smart Cart

Upgrade the platform with a Smart Cart pricing engine, delivery routing, vendor wallet, interactive stadium map, and custom vendor-to-fan notifications.

## User Review Required

> [!IMPORTANT]
> **Database Reset Required.** New columns on the `Order` model mean we must run `python scripts/reset_db.py` before starting the servers. This wipes all existing data.

> [!WARNING]
> **Currency Change.** All monetary values switch from `$` to `₹` globally (backend responses + frontend UI). This is irreversible in the UI layer.

---

## Proposed Changes

### Phase 1: Backend Architecture & Business Logic

#### [MODIFY] [models.py](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/backend/app/models.py)
- Add `DeliveryMethodEnum` (`pickup`, `seat_delivery`)
- Add new `Order` columns: `delivery_method`, `subtotal`, `delivery_fee`, `discount`, `total_price`, `vendor_message`, `freebies` (JSON)
- Import `JSON` from SQLAlchemy for the `freebies` column

#### [MODIFY] [schemas.py](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/backend/app/schemas.py)
- Update `OrderCreate` with `delivery_method` (default `"pickup"`)
- Update `OrderResponse` with all new financial fields + `vendor_message` + `freebies`
- Add `OrderStatusUpdate` schema with optional `vendor_message`

#### [MODIFY] [orders.py](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/backend/app/routers/orders.py)
- **Smart Cart Engine** in `create_order`:
  - Look up `MenuItem` price from DB (never trust frontend pricing)
  - Calculate `subtotal` from item price
  - Apply tiered promotional rules:
    - `> ₹500`: free delivery + freebies `["Water Bottle", "Snacks"]`
    - `> ₹200`: ₹30 delivery + freebies `["Water Bottle", "Snacks"]`
    - `> ₹150`: standard delivery + freebies `["Water Bottle", "Snacks"]`
    - `> ₹100`: standard delivery + freebies `["Water Bottle"]`
    - `≤ ₹100`: standard delivery, no freebies
  - `delivery_fee = ₹60` for seat_delivery, `₹0` for pickup (before promotional override)
  - Compute `total_price = subtotal + delivery_fee - discount`
- **Update** `update_order_status` to accept JSON body with optional `vendor_message`, and broadcast it in the WebSocket payload

#### [MODIFY] [vendors.py](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/backend/app/routers/vendors.py)
- Add `GET /vendors/{vendor_id}/wallet` endpoint:
  - Aggregate: `total_sales` (sum of `total_price` of delivered orders), `total_orders`, `pending_orders`
  - Return order history list (id, item, total_price, status, block/row/seat)

---

### Phase 2: Fan Experience Overhaul (React)

#### [MODIFY] [FanDashboard.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/pages/FanDashboard.jsx)
- Replace all `$` with `₹` in price display
- Add delivery method toggle (Pickup / Seat Delivery +₹60) in the order flow
- Show dynamically calculated `total_price` before ordering
- Display celebratory freebie banner (`🎉 You earned a Free Water Bottle!`)
- Display `vendor_message` in the active orders tracker when status is `ready`/`delivered`

#### [NEW] [StadiumMapPage.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/pages/StadiumMapPage.jsx)
- New dedicated page at `/map` route
- CSS Grid-based interactive stadium layout (no Leaflet dependency)
- Color-coded areas: Gates 1-4 (Green), Blocks A-D (Blue), Restrooms (Yellow), Vendor Stalls (Orange)
- Pulsing "You Are Here" dot (simulated live location)
- Responsive design with hover tooltips and smooth animations

#### [MODIFY] [App.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/App.jsx)
- Add `/map` route inside the `SidebarLayout` (accessible to fan, vendor, admin)

#### [MODIFY] [SidebarLayout.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/components/SidebarLayout.jsx)
- Add "Stadium Map" nav link with `Map` icon from lucide-react
- Add "Wallet" nav link for vendors with `Wallet` icon

---

### Phase 3: Vendor Dashboard & Financials

#### [MODIFY] [VendorDashboard.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/pages/VendorDashboard.jsx)
- Replace all `$` with `₹`
- When "Mark as Ready" is clicked, show an inline modal/input for `vendor_message`
  - Quick-select templates: "Ready at Counter 2", "Out for delivery", "Pickup at Gate A"
  - Send message in the PUT request body

#### [NEW] [VendorWallet.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/pages/VendorWallet.jsx)
- New route at `/vendor/wallet`
- KPI cards: Total Revenue (₹), Pending Orders, Completed Orders
- Google Material-inspired design with clean borders and font weights
- Data table: Order History (Order ID, Fan Name reference, Items, Total Paid, Status)

---

## Verification Plan

### Automated Tests
1. Run `python scripts/reset_db.py` to ensure new columns are created
2. Start backend: `uvicorn app.main:app --reload`
3. Start frontend: `npm run dev`
4. Browser test: Register → Login → Browse vendors → Place order with seat delivery → Verify pricing breakdown
5. Browser test: Vendor login → Receive order → Mark Ready with custom message → Verify fan sees message
6. Browser test: Navigate to Stadium Map page → Verify interactive grid renders
7. Browser test: Navigate to Vendor Wallet → Verify KPIs and order history table

### Manual Verification
- Confirm all `₹` symbols display correctly (no leftover `$`)
- Confirm WebSocket patterns are preserved (no double messages)
- Confirm promotional tiers calculate correctly for various price points
