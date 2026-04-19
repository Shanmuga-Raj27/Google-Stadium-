# Google Stadium UI Overhaul & Stability Refinement

This goal tackles the requested stabilization of WebSocket connections, comprehensive CSS adjustments (typography/colors) across the entire platform, introducing a collapsible sidebar view, and targeted updates to both the Fan and Admin Dashboards as per the Mission Checklist.

## Proposed Changes

### Phase 1: WebSocket Stability (Emergency Fix)

#### [MODIFY] `components/ChatWidget.jsx`
- Introduce a strict null-check in the `useEffect` cleanup return to prevent calling `.close()` on an uninitialized WebSocket instance.

### Phase 2: Google UI & Global Layout Updates

#### [MODIFY] `Frontend Pages and Components`
- Overhaul typography: Swap overly aggressive font weights (`font-extrabold`, `font-black`) to standard Material UI weight equivalents (`font-normal`, `font-medium`, `font-semibold`).
- **Files Affected**:
  - `pages/VendorDashboard.jsx`
  - `pages/Register.jsx`
  - `pages/Login.jsx`
  - `pages/FanDashboard.jsx`
  - `pages/AdminDashboard.jsx`
  - `components/SidebarLayout.jsx`

#### [MODIFY] `components/SidebarLayout.jsx`
- Replace hardcoded `w-64` with responsive classes for expand/collapse states (e.g. `w-64` vs `w-20`).
- Add a new "Hamburger" or "Chevron" toggle button at the top/bottom of the sidebar.
- Conditionally hide text labels for NavLinks and user info when minimized, maintaining icons only.

### Phase 3: Dashboard Specific Refinements

#### [MODIFY] `pages/FanDashboard.jsx`
- Refactor the "Gate Status UI". Replace the previous instances of Gates A, B, and C with a modernized gate layout showing Gates 1, 2, 3, and 4. Adjust the placeholder grid layout to accommodate an even number of gates.

#### [MODIFY] `pages/AdminDashboard.jsx`
- Restructure the "Global Controls" panel. Replace generic emergency placeholders with structured, individual controls specifically targeting Gates 1, 2, 3, and 4 to adjust their live traffic status.

#### [MODIFY] `pages/VendorDashboard.jsx`
- Locate and safely strip out the "Switch Profile" utility button from the header block without breaking the primary logout logic layout.

## Verification Plan

### Automated Tests
- No automated UI tests exist in Phase 1 scopes, compilation/linting check will be observed via Vite terminal after changes `npm run build` or `npm run dev`.

### Manual Verification
- Review Sidebar expand/collapse behavior on local web preview.
- Ensure WebSocket chat disconnects gracefully when components unmount using browser logs.
- Verify Fan dashboard horizontally displays properly for 4 Gates instead of 3.
- Verify Admin dashboard displays specific traffic controls for all 4 Gates.
