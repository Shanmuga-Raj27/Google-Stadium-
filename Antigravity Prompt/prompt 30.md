# MISSION: Global Chat Integration & UI Fix

**Role:** Senior React Developer
**Context:** The global chat feature is currently only functioning on the `FanDashboard`. It is missing or failing on the `VendorDashboard` and `AdminDashboard`. 

**Execution Checklist:**

### PHASE 1: Component Audit
1. Check `VendorDashboard.jsx` and `AdminDashboard.jsx`. 
2. Ensure the `<ChatWidget />` (or equivalent global chat component) is properly imported at the top of the file.
3. Ensure the `<ChatWidget />` is rendered in the JSX return block of both dashboards, placing it in a consistent UI location (e.g., floating at the bottom right, same as the Fan dashboard).

### PHASE 2: Prop & Context Verification
1. Analyze how `FanDashboard.jsx` calls the Chat component. Are there required props (like `userId`, `username`, `token`, or `role`)?
2. If yes, ensure `VendorDashboard.jsx` and `AdminDashboard.jsx` extract those exact same variables from your Auth context/state and pass them down to the Chat component.

### PHASE 3: WebSocket Sanity Check
1. Open the Chat component (`ChatWidget.jsx` or similar). 
2. Double-check the WebSocket URL. Ensure it is using the dynamic fallback we set up earlier:
   `const apiUrl = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";`
   `const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws/global-chat'; // (or whatever your endpoint is)`

**Constraints:** * Do not alter any existing Vendor or Admin business logic. Only inject the Chat UI and necessary props.