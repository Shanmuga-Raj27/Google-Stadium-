# Global UI Overhaul & WebSockets Plan

Implement the global layout overhaul for Google Stadium v2, fix the lazy-loading data flow from the backend, and complete the live WebSocket functionality.

## User Review Required
> [!IMPORTANT]
> The project currently uses **Tailwind CSS v4** (via `@tailwindcss/vite`). Tailwind v4 shifted away from `tailwind.config.js` to a purely CSS-based `@theme` structure inside `index.css`. I will apply the dark mode classes and Google color injections directly into `index.css` via `@theme` to properly abide by the v4 framework standards instead of injecting a legacy config file.

## Proposed Changes

---

### Backend (FastAPI)

#### [MODIFY] [models.py](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/backend/app/models.py)
- Confirm `VendorProfile.menu_items` relationship incorporates `lazy="selectin"` (already present from prior phase workflow but will enforce schema `from_attributes=True` verification).

#### [MODIFY] [orders.py](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/backend/app/routers/orders.py)
- Fix WebSocket broadcast payloads:
  - On `POST /` (new order): Emit `{'type': 'NEW_ORDER', 'data': {...}}` to the vendor's user ID.
  - On `PUT /{order_id}/ready` (ready): Emit `{'type': 'ORDER_READY', 'data': {...}}` to the fan's user ID.

#### [MODIFY] [main.py](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/backend/app/main.py)
- Establish a distinct Chat broadcast channel logic or standalone dictionary mapping within `ConnectionManager`.
- Expose the `/ws/chat/{user_id}` route to accept a user's web socket.
- On received payload, decode and broadcast it structurally to all globally connected clients appended with `sender`, `role`, and `message`.

---

### Frontend Configuration & Context

#### [NEW] [ThemeContext.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/store/ThemeContext.jsx)
- Simple global React Context wrapper that dynamically adds/removes the `dark` attribute on HTML `<body>`/`<html className="dark">` based on a toggle state.

#### [MODIFY] [index.css](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/index.css)
- Implement Tailwind v4 global theme keys (`--color-googleBlue: #4285F4`, etc.).
- Add `@custom-variant dark (&:is(.dark *));` to inject semantic selector dark mode support naturally. 
- Eliminate inline base body margin constraints if they break layout padding.

#### [MODIFY] [App.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/App.jsx)
- Wrap `<Router>` inside `<ThemeProvider>`.
- Redirect root natively if it differs, and wrap inner core dashboard rendering (like Fan/Vendor dashboards) inside our `<SidebarLayout>`.

#### [MODIFY] [ProtectedRoute.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/components/ProtectedRoute.jsx)
- Apply guard statements matching Phase 2 constraints directly to return `<Navigate to="/login" replace />` exclusively.

#### [MODIFY] [Register.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/pages/Register.jsx)
- Inject `<option value="admin">Admin</option>` natively into the role selector element manually.

---

### Frontend UI Components

#### [NEW] [SidebarLayout.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/components/SidebarLayout.jsx)
- Grid or Flex structural base dividing Left Navigation from Right Content wrapper.
- Utilize standard lucide-react icons for visual navigation mapping.
- Support Dark Mode toggle injection into layout structure.

#### [NEW] [ChatWidget.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/components/ChatWidget.jsx)
- Floating persistent widget anchored to bottom-right or side navigation.
- Automatically maintains `/ws/chat/ID` websocket connection directly to `main.py`.
- Maps incoming broadcast lists. Explicitly implements `font-bold text-googleRed` constraint when checking `role === 'admin'`.

#### [MODIFY] [FanDashboard.jsx](file:///c:/Users/USER/.gemini/antigravity/scratch/Google%20Prompt-War%20Projects/Google%20Stadium/google-stadium/frontend/src/pages/FanDashboard.jsx)
- Enhance structural layout.
- Bind the real Gate UI map rendering via top layout banner logic.
- Evolve state listening behavior on order payloads from `ORDER_READY` dynamic rendering natively so state modifies gracefully.

## Open Questions

None currently. Assuming `lucide-react` is installed per previously recognized configurations; will proceed immediately via normal script updates.

## Verification Plan

### Automated Tests
- Validate all Tailwind injections are compiled properly using Vite native engine preview compilation natively.
- Assure Python API dependencies accept all internal Pydantic nested models gracefully via dry command testing inline. 

### Manual Verification
- Will evaluate `/test` endpoints functionally validating WebSocket local echo rendering functionality functionally to determine success.
