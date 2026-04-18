# MISSION: Google Stadium v2 - The Final Fix & Zomato-Style Delivery Flow

**Role:** Senior Full-Stack Architect & React Specialist
**Context:** The application is suffering from a fatal React StrictMode WebSocket race condition (`Cannot read properties of null (reading 'close') at ws.onopen`). We must patch this using block-scoped local variables. 
Simultaneously, we are implementing a robust order-tracking feature. Fans will select their exact seat location before ordering, and Vendors will update the order status through a full pipeline (Placed -> Preparing -> Ready -> Delivered) which triggers live notifications for the Fan.

**Execution Checklist:**

### PHASE 1: The Bulletproof WebSocket Fix (Emergency)
1. **Refactor `websocket.js` / Chat / Order Hooks:**
   * **STOP** using `ws.current` or `useRef` to manage the WebSocket lifecycle inside `useEffect`.
   * **USE** a local block-scoped variable. 
   * Apply this exact pattern to ALL WebSocket connections in the frontend:
     ```javascript
     useEffect(() => {
       const socket = new WebSocket("ws://localhost:8000/ws/...");
       
       socket.onopen = () => console.log("Connected");
       socket.onmessage = (event) => { /* handle message */ };
       socket.onerror = (error) => console.error("WS Error:", error);
       
       return () => {
         // The closure guarantees 'socket' is never null here.
         if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
           socket.close();
         }
       };
     }, []); // Ensure dependency array is correct
     ```

### PHASE 2: Database & Backend Upgrades
1. **Update `models.py` & `schemas.py`:**
   * Expand the `Order` model to include `block` (String), `row` (String), and `seat` (String). Make them nullable if necessary, but required in the Pydantic create schema.
   * Expand the `status` Enum for Orders to include: `pending`, `preparing`, `ready`, and `delivered`.
2. **Update `routers/orders.py`:**
   * Ensure the `POST /orders` endpoint accepts the seat details and saves them.
   * Update the `PUT /orders/{id}/{status}` endpoint to handle all new statuses.
   * **CRITICAL:** When an order status updates, use the WebSocket manager to broadcast a notification specifically to the Fan's channel: `{"type": "ORDER_STATUS_UPDATE", "data": { ...order_details... }}`.

### PHASE 3: Fan Dashboard Upgrades (Seat Selection & Tracking)
1. **Seat Selection UI (`FanDashboard.jsx`):**
   * Before a user can click "Order" on a menu item, require them to input their location. Create three small, clean input fields: `Block` (e.g., A), `Row` (e.g., 3), and `Seat` (e.g., 12).
   * Pass these values into the `POST /orders` payload.
2. **Live Order Tracker UI:**
   * Create a "My Active Orders" section. 
   * When listening to the `ORDER_STATUS_UPDATE` WebSocket event, update the local state.
   * Render a visual progress tracker for the order (e.g., a stepper: `Placed -> Preparing -> Ready for Pickup/Delivery -> Delivered`). 
   * If the status changes to "Ready," trigger a browser `alert()` or a beautiful React toast notification: *"Your order is ready at Block A, Row 3!"*

### PHASE 4: Vendor Dashboard Upgrades
1. **Rich Order Cards (`VendorDashboard.jsx`):**
   * Update the incoming Order Cards to prominently display the Fan's location: `Deliver to: Block A, Row 3, Seat 12`.
2. **Pipeline Controls:**
   * Replace the single "Ready" button with a sequence of action buttons: "Start Preparing", "Mark as Ready", and "Confirm Delivered". 
   * Clicking these buttons hits the backend `PUT /orders/{id}/{status}` endpoint, which in turn fires the WebSocket notification back to the Fan.

**Constraints:** Ensure all UI updates use Google Material design (clean padding, rounded corners, subtle shadows, `blue-500` primary buttons). Do not break existing chat functionality.