# MISSION: Google Stadium v3.5 - Interactive SVG Editor & Hybrid Tracking

**Role:** Principal SaaS Architect & SVG UI/UX Expert
**Context:** We are replacing the free-form drag-and-drop map with a highly polished, interactive "SVG Template Editor". The Admin must be able to click hardcoded sections of a round stadium template to rename/recolor them. Fans will use manual location entry (e.g., Block A) which the system will map to specific X/Y coordinates on the SVG to draw a delivery tracking line. 

**Execution Checklist:**

### PHASE 1: Backend Setup & Admin Cleanup (FastAPI)
1. **Remove Admin Wallet:** Strip all financial, wallet, and sales history routing/UI from the Admin Dashboard. These belong strictly to Vendors.
2. **Map Config Database:** * Update the `stadium_layouts` table (or create `map_configs`) to store a JSON dictionary of overrides: `{"block-A": {"label": "VIP Block", "color": "red"}, "gate-1": {"label": "North Gate"}}`.
   * Create a strict Pydantic model (`MapConfigSchema`) to validate this dictionary to ensure security and prevent injection. Create `GET` and `POST` endpoints to fetch/save this configuration.

### PHASE 2: The Core SVG Template (`components/StadiumSVG.jsx`)
1. **Create a Modular SVG Component:** Do not clutter main files with massive SVG strings. Create a dedicated `StadiumSVG.jsx` component.
2. **Draw the Round Stadium:**
   * Use `<svg viewBox="0 0 800 800" className="w-full h-auto">`.
   * **Center:** A green circular or oval pitch.
   * **Seating Blocks:** Draw 4 large, curved SVG wedges (paths) surrounding the pitch representing Block A, B, C, and D. Add small text or lines inside to represent Rows.
   * **Outer Ring:** Draw circles/rectangles for Gate 1, 2, 3, 4, two Restrooms, and two Food Stalls.
   * **IDs:** Assign a strict, unique `id` to every clickable `<path>` and `<circle>` (e.g., `id="block-A"`).

### PHASE 3: Admin Template Editor (`AdminMapEditor.jsx`)
1. **Interactive UI:**
   * Render the `StadiumSVG`. 
   * Add an `onClick` handler to the SVG paths. When the Admin clicks a specific shape (e.g., Block A), open an editing panel.
   * **Mobile-First Panel:** On desktop, this is a right-hand sidebar. On mobile, this MUST be a fixed "Bottom Sheet" that slides up.
2. **Form & Save:**
   * The panel should contain a text input to change the `label` (e.g., rename to "Block 1") and a color picker/dropdown.
   * Save these changes to a local state dictionary, and use a Floating Action Button (FAB) to `POST` the final dictionary to the backend.

### PHASE 4: Hybrid Fan/Vendor Live Tracking (`FanDashboard.jsx`)
1. **The Coordinate Dictionary:**
   * In the frontend, create a hardcoded mapping of your SVG element IDs to their exact visual center points. 
   * Example: `const MAP_COORDS = { "block-A": {x: 400, y: 150}, "block-B": {x: 650, y: 400}, "stall-1": {x: 100, y: 100} };`
2. **Order Plotting:**
   * When a Fan places an order, they type their location (e.g., Block B, Row 4). 
   * Render the `StadiumSVG` applying the Admin's custom labels/colors fetched from the database.
   * Overlay a Blue Dot `<div>` absolutely positioned at `MAP_COORDS["block-B"]`.
   * Overlay an Orange Dot at the Vendor's assigned coordinate (e.g., `stall-1`).
   * Draw a dashed SVG `<line>` connecting the two coordinates to simulate a live delivery route.

**Constraints & UI/UX:** * Strictly follow Google Material Design 3. Use rounded corners, clean whitespace, and elevated cards. 
* Ensure inputs do not cause mobile browsers to zoom awkwardly (use `text-base` or `16px` font size for inputs).
* The code must be pristine, using React Fragments `<></>` properly to prevent Vite `[PARSE_ERROR]` crashes.