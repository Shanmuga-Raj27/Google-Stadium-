# Google Stadium v2 - Admin Routing, Live Sync & Chat Overhaul

This implementation plan focuses on executing the mission to finalize Admin controls, introduce live-synced Gate status using WebSockets, completely overhaul the Global Chat widget (fixing StrictMode crashes + Double messages + secure overriding identities), and apply proper Google Material Design bounds.

## Proposed Changes

### Phase 1: Emergency WebSocket Stability

#### [MODIFY] `frontend/src/services/websocket.js`
- Implement strict null-guards `if (!this.ws) return;` across the `onopen`, `onmessage`, `onclose`, and `onerror` methods to prevent `Cannot read properties of null` unmount exceptions during fast React rerenders safely. 

#### [MODIFY] `frontend/src/components/ChatWidget.jsx`
- Fortify the internal `wsRef.current.onmessage` and `onclose` callback boundaries with a `if (!wsRef || !wsRef.current) return;` check.

### Phase 2: Global Chat Fixes & Material UI

#### [MODIFY] `backend/app/main.py`
- Refactor the `@app.websocket("/ws/chat/{client_id}")` endpoint.
- Inject `db: AsyncSession = Depends(get_db)` to query the SQLite/Postgres DB securely context.
- Before entering the `while True` receive loop, query the `User` and `VendorProfile` objects mapped to `client_id`.
- Intercept any JSON payloads from the frontend and maliciously OVERRIDE `msg_data["sender_meta"]` and `msg_data["role"]`. This acts as the **Role Identity Fix**, enforcing `Username (Role)` for Admins/Fans, and `Username (Store Name)` for Vendors.

#### [MODIFY] `frontend/src/components/ChatWidget.jsx`
- Replace raw sender values with `msg.sender_meta`.
- Stripped neon/extrabold rendering in favor of standard Material `font-normal text-gray-900 dark:text-gray-100`.
- Applied color-coded thin borders wrapping the `ChatWidget` bubbles statically matching role metadata:
  - Admin: `border border-red-500`
  - Vendor: `border border-green-500`
  - Fan: `border border-blue-500`

### Phase 3: Admin Routing & Live Gate Sync

#### [NEW] `frontend/src/pages/AdminGates.jsx`
- Move existing Gate Traffic layout entirely out of `AdminDashboard.jsx`.
- Implement `PUT` networking using Axios that targets the backend new API route logic when toggling Gate dropdown menus. 

#### [MODIFY] `frontend/src/pages/AdminDashboard.jsx`
- Strip the current Gate logic HTML fragments leaving the layout leaner for User administration.

#### [MODIFY] `frontend/src/App.jsx`
- Mount `/admin/gates` route using existing `<ProtectedRoute allowedRoles={['admin']}>`.

#### [MODIFY] `frontend/src/components/SidebarLayout.jsx`
- Conditionally render a NavLink targeting `/admin/gates` when `user.role === 'admin'`.

#### [MODIFY] `backend/app/main.py`
- Add an in-memory `mock_gates_db` and expose REST endpoint: `PUT /gates/{id}`.
- Upon saving, inherently use `manager.broadcast` delivering the `{"type": "GATE_UPDATE", "data": {"gate_id": id, "status": new_status}}` format universally globally.

#### [MODIFY] `frontend/src/pages/FanDashboard.jsx`
- Instantiate internal state `const [gates, setGates]` for tracking Gate 1-4 limits.
- Process incoming `msg.type === 'GATE_UPDATE'` payload seamlessly appending traffic state visually matching the React state logic over WebSockets dynamically.

## Verification Plan
1. **Chat UI/UX:** Test local WebSocket connections confirming double connections don't echo message states twice in development boundaries. Verify borders appear in correct shades seamlessly.
2. **Backend Sync:** Ensure hitting `/gates/1` via dropdown synchronously executes on the broader Fan WebSocket stream array without timeouts.
