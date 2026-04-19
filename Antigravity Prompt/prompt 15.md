# TASK: Fix Global Chat Echo and WebSocket Warnings

**Role:** Senior React Developer
**Context:** The chat widget is echoing messages locally, and the browser console is filled with `WebSocket is closed before the connection is established` warnings due to StrictMode aborting connections during the `CONNECTING` phase.

**Execution Instructions:**

1. **Fix the Chat Echo (`ChatWidget.jsx`):**
   * Locate the function that handles sending a new message (e.g., `handleSendMessage`).
   * **REMOVE** any local state updates (e.g., `setMessages(prev => [...prev, newMsg])`) from this function. 
   * The function should ONLY execute `socket.send(JSON.stringify(payload))` and clear the input field. The local state MUST ONLY be updated inside the `socket.onmessage` event listener.

2. **Silence StrictMode WebSocket Warnings (Global):**
   * Audit all `useEffect` cleanup functions across `ChatWidget.jsx`, `FanDashboard.jsx`, and `VendorDashboard.jsx`.
   * Update the cleanup logic to ONLY call `.close()` if the WebSocket is fully open. Aborting a socket while it is connecting (`readyState === 0`) throws browser console errors.
   * Use this exact pattern for all WebSocket cleanups:
     ```javascript
     return () => {
       // 1 = WebSocket.OPEN
       if (socket.readyState === 1) {
         socket.close();
       }
     };
     ```
   * Ensure `socket` refers to the block-scoped constant, not a `useRef` variable.

Output the corrected `ChatWidget.jsx` and apply the cleanup fix to any other dashboard components.