# MISSION: Mobile-First UI Polish & Layout Fix (Non-Destructive)

**Role:** Senior UX/UI Engineer & Tailwind CSS Expert
**Context:** The application is functionally complete, but the mobile layout is broken in several places. Specifically, on the `FanDashboard.jsx`, inside the "available vendors" section, the food emoji, food name, price, and "Order" button are overlapping/merging on mobile screens, making the text invisible and the button unusable.

**CRITICAL DIRECTIVES:**
* **UI ONLY:** You are strictly forbidden from altering any React state, `useEffect` hooks, API calls, or database logic. 
* **Tailwind Only:** Fix the layouts using standard Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Do not write custom CSS.
* **Non-Destructive:** Do not delete any existing UI elements, just restructure their containers.

Execute the following phases:

### PHASE 1: The Fan Dashboard Menu Fix (High Priority)
**Target:** `FanDashboard.jsx` (specifically the menu item cards).
1. Locate the UI mapping for the vendor's menu items.
2. Change the container's flex/grid behavior to be mobile-friendly. 
   - **On mobile (`< 768px`):** Stack the elements (e.g., `flex-col`, `items-start`, `gap-2`) so the emoji, name, price, and button have their own vertical space.
   - **On desktop (`md:`):** Revert to a spacious horizontal row (`md:flex-row`, `md:items-center`, `md:justify-between`).
3. Ensure long food names wrap properly on small screens instead of pushing other elements out of the container.

### PHASE 2: Global Mobile Container Audit
**Target:** `Login.jsx`, `Register.jsx`, `FanDashboard.jsx`, `VendorDashboard.jsx`, `AdminDashboard.jsx`.
1. **Padding:** Ensure main container wrappers have reduced padding on mobile (e.g., `p-4 md:p-8`).
2. **Grids:** Any dashboard utilizing CSS Grid must collapse to a single column on mobile (e.g., `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
3. **Navigation/Headers:** Ensure headers and logout buttons don't overlap on small screens (use `flex-wrap` if necessary).

### PHASE 3: Chat Widget Mobile Restructure
**Target:** `ChatWidget.jsx`
1. Ensure the floating chat window does not consume 100% of the screen height on mobile, obscuring the dashboards. Limit its height (e.g., `h-80 md:h-96`) and ensure it remains tucked into the bottom corner or cleanly overlaid.