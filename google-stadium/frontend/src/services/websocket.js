export class WebSocketClient {
  constructor(path, onMessage) {
    const apiUrl = import.meta.env.VITE_API_URL || "https://google-stadium-backend.onrender.com";
    const wsBase = apiUrl.replace(/^http/, 'ws');
    this.url = `${wsBase}${path}`;
    this.onMessage = onMessage;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectDelay = 5000;
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      if (!this.ws) return;
      console.log(`Connected to WS: ${this.url}`);
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      if (!this.ws) return;
      const data = JSON.parse(event.data);
      if (this.onMessage) {
        this.onMessage(data);
      }
    };

    this.ws.onclose = () => {
      if (!this.ws) return;
      console.log(`Disconnected from WS: ${this.url}. Reconnecting...`);
      this.reconnect();
    };

    this.ws.onerror = (err) => {
      if (!this.ws) return;
      console.error(`WS Error: `, err);
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    };
  }

  reconnect() {
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);
    this.reconnectAttempts++;
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.onclose = null; // prevent reconnect
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      } else if (this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.onopen = () => this.ws.close();
      }
      this.ws = null;
    }
  }
}
