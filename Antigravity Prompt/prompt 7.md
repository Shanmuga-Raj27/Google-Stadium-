# MISSION: Google Stadium v2 - Global UI Overhaul, WebSockets & Chat

**Role:** Senior Full-Stack Architect
**Context:** We are upgrading "Google Stadium v2". We must fix backend lazy-loading, finalize the live WebSocket order flow, and completely overhaul the UI. The new UI must feature Google Material styling, global Dark/Light mode, a persistent left sidebar, and a global live chat where Admin messages are visually highlighted.

**Execution Checklist:**

### PHASE 1: Backend Upgrades (FastAPI)
1. **Lazy Loading Fix:** In `app/models.py`, ensure the `VendorProfile` to `Menu_Items` relationship uses `lazy="selectin"`. Ensure schemas use `from_attributes=True`.
2. **Order WebSockets:** In `app/routers/orders.py`, broadcast `{"type": "NEW_ORDER", "data": {...}}` to the specific vendor when a fan orders. Broadcast `{"type": "ORDER_READY", "data": {...}}` to the fan when the vendor marks it ready.
3. **Global Chat WebSocket:** Create a new endpoint `ws/chat/{user_id}` in `app/main.py` or a dedicated router. 
   * This manager must broadcast all received messages globally to *all* connected clients. 
   * The payload must include the sender's role: `{"sender": "Username", "role": "admin|vendor|fan", "message": "Hello"}`.

### PHASE 2: Frontend Global Config & Routing (React)
1. **Tailwind & Theme:** * Update `tailwind.config.js` to support `darkMode: 'class'`. 
   * Add Google brand colors to the Tailwind theme: `googleBlue: '#4285F4'`, `googleRed: '#EA4335'`, `googleYellow: '#FBBC05'`, `googleGreen: '#34A853'`.
   * Create a ThemeContext to toggle the `dark` class on the HTML `<body>` tag.
2. **Routing Fixes (`App.jsx` & `ProtectedRoute.jsx`):**
   * Base route `/` must `<Navigate to="/login" replace />`.
   * The Auth Guard must immediately redirect to `/login` if no user object exists in state. Do not render black screens.
   * In `Register.jsx`, add `<option value="admin">Admin</option>` to the role dropdown.

### PHASE 3: The New UI Layout & Components
1. **Global Sidebar Layout (`SidebarLayout.jsx`):**
   * Create a wrapper component used by all protected routes. 
   * **Left Side:** A persistent navigation sidebar featuring links (Dashboard, Orders), the User's Profile/Role, a Logout button, and a Sun/Moon icon toggle for Light/Dark mode. Use modern, padded UI elements.
   * **Right Side:** The main content area where the specific dashboard renders.
2. **Global Live Chat Widget:**
   * Create a floating or fixed chat window accessible in the Layout. Connects to `/ws/chat`.
   * **Admin Highlighting:** Map incoming messages. If `message.role === 'admin'`, style the text dynamically using Tailwind `font-bold text-googleRed dark:text-red-400` to ensure announcements stand out.
3. **Fan Dashboard (`FanDashboard.jsx`):**
   * **Gate Status UI:** At the top of the dashboard, render a clean, horizontally scrolling row of Gate Status cards. Use Tailwind background colors: Gate A (Green - Low), Gate B (Yellow - Medium), Gate C (Red - High).
   * **Vendor Menu:** Map over eagerly-loaded `vendor.menu_items`. Render the emoji `icon` largely, alongside `name` and `price`.
   * **Live State:** Ensure WebSockets update the React state dynamically without requiring page reloads for order status changes.

**Constraints:** Ensure high-quality, modern, accessible design. Use `lucide-react` for icons if needed. Code must be robust and crash-proof.