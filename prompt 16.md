# TASK: Eradicate Global Chat Echo (Double Message Bug)

**Role:** Senior React & FastAPI Architect
**Context:** The global chat application is rendering every sent message exactly twice. This is caused by either optimistic state updates inside the send function, or ghost WebSocket event listeners caused by React StrictMode improper cleanup.

**Execution Instructions:**

### 1. Frontend: Strict React WebSocket Pattern (`ChatWidget.jsx`)
Rewrite the `useEffect` and send logic in the chat widget to strictly adhere to this pattern. Do not deviate.

* **Remove Optimistic Updates:** The `handleSendMessage` function MUST ONLY execute `socket.send(JSON.stringify(payload))` and clear the input state. It **MUST NOT** call `setMessages`.
* **Strict Listener Cleanup:** Use a local variable for the WebSocket and ensure the `onmessage` listener uses a functional state update to prevent stale closures.

**Force this exact structure:**
```javascript
useEffect(() => {
  const ws = new WebSocket(`ws://localhost:8000/ws/chat/${userId}`);
  
  ws.onmessage = (event) => {
    const incomingData = JSON.parse(event.data);
    // ONLY update state here, using functional update
    setMessages((prevMessages) => [...prevMessages, incomingData]);
  };

  return () => {
    // Completely kill the socket and its listeners on unmount
    ws.onmessage = null; 
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}, [userId]); // Ensure dependencies are correct

2. Backend: Connection Manager Duplicate Prevention
In app/main.py (or wherever the ConnectionManager is defined), ensure the connect method prevents the same WebSocket object from being added to the active_connections list multiple times.

Example: if websocket not in self.active_connections: self.active_connections.append(websocket)

Ensure the backend broadcasts the message normally. Do not attempt to filter out the sender on the backend; the frontend should render the message when it receives the broadcast.

Output the corrected ChatWidget.jsx and the updated FastAPI ConnectionManager logic.


By explicitly setting `ws.onmessage = null` in the cleanup and removing any local state updates when you click send, this prompt physically removes the code's ability to echo the message. 

Let me know once Antigravity applies this; your chat should finally be perfectly