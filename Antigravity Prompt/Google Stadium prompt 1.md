# MISSION: Project Google Stadium Initialization & Development

**Role:** You are an expert Senior Full-Stack Engineer and Software Architect. Your task is to build "Google Stadium," a real-time physical event experience application featuring smart queuing and live crowd wayfinding.

**Tech Stack:**
* **Backend:** Python, FastAPI, WebSockets, SQLAlchemy, asyncpg
* **Frontend:** React, Vite, Leaflet.js (React-Leaflet), TailwindCSS
* **Database:** Raw PostgreSQL (No Supabase, No ORM abstraction layers beyond SQLAlchemy)
* **Package Managers:** `uv` (Python), `npm` (Node.js - Strict safe packages only)

---

## 1. PROJECT ARCHITECTURE
Create the following directory structure strictly. Do not deviate.

```text
google-stadium/
├── .env                  # Global secrets (DB credentials, API keys)
├── backend/
│   ├── .venv/            # Python virtual environment (managed by uv)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py       # FastAPI entry point & WebSocket manager
│   │   ├── database.py   # SQLAlchemy asyncpg connection engine
│   │   ├── models.py     # Database schema (Users, Vendors, Orders, Locations)
│   │   ├── schemas.py    # Pydantic validation models
│   │   └── routers/      # API route handlers
│   │       ├── __init__.py
│   │       ├── orders.py
│   │       ├── map.py
│   │       └── auth.py
│   └── requirements.txt  # Exported from uv
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── components/
    │   │   ├── StadiumMap.jsx    # React-Leaflet implementation
    │   │   ├── VendorMenu.jsx
    │   │   └── NotificationBadge.jsx
    │   ├── pages/
    │   │   ├── FanDashboard.jsx
    │   │   ├── VendorDashboard.jsx
    │   │   └── AdminDashboard.jsx
    │   ├── services/
    │   │   ├── api.js            # Axios REST calls
    │   │   └── websocket.js      # WebSocket connection manager
    │   └── assets/
    │       └── stadium-blueprint.jpg  # Base image for Leaflet custom CRS map


2. EXECUTION PHASES
Execute the following tasks sequentially. Verify each step before moving to the next.

PHASE 1: Environment & Secrets Setup
Create a root .env file containing placeholders for DATABASE_URL (PostgreSQL asyncpg format) and PORT assignments.

Backend Setup:

Create the backend/ directory.

Inside backend/, initialize the project using uv.

Run uv venv to create the virtual environment.

Use uv pip install to install strictly: fastapi, uvicorn, sqlalchemy, asyncpg, pydantic, python-dotenv, websockets.

Freeze dependencies using uv pip freeze > requirements.txt.

Frontend Setup:

Create the frontend/ directory.

Run npm create vite@latest . -- --template react inside the frontend directory.

Install core, well-known dependencies safely: npm install axios react-router-dom leaflet react-leaflet lucide-react.

Do not install any obscure or low-download-count third-party mapping plugins. Use core leaflet only.

PHASE 2: Database & Backend Scaffolding
In backend/app/database.py, set up an asynchronous SQLAlchemy engine connecting to the PostgreSQL URL from the .env file.

In backend/app/models.py, write raw SQLAlchemy models for:

User (id, role: fan/vendor/admin)

Order (id, user_id, vendor_id, item, status: pending/ready/complete)

LocationPing (id, zone, timestamp)

In backend/app/main.py, initialize the FastAPI app. Implement a robust WebSocket connection manager capable of tracking active connections, broadcasting JSON payloads to all connected clients, and sending direct messages to specific clients.

PHASE 3: Frontend Scaffolding & Indoor Map
Set up standard React routing in App.jsx for /fan, /vendor, and /admin views.

In frontend/src/services/websocket.js, write a clean, reconnecting WebSocket client that listens for incoming JSON events (e.g., ORDER_READY, MAP_UPDATE).

The Leaflet Indoor Map:

In StadiumMap.jsx, initialize a React-Leaflet MapContainer.

Configure L.CRS.Simple to disable geographic coordinates.

Use ImageOverlay to render a placeholder image from assets/stadium-blueprint.jpg as the base map.

Create a function to plot dynamically received [x, y] coordinates as Leaflet Markers on top of the image overlay.

PHASE 4: Core Workflows (Integration)
The Smart Queue: Implement the REST POST /orders endpoint in FastAPI. Upon a successful database write, the backend must use the WebSocket manager to ping the specific vendor's dashboard.

The Heatmap: Create a continuous loop or endpoint in FastAPI that calculates the density of active orders/pings per zone and broadcasts a {zone: 'A', status: 'crowded'} payload via WebSocket to all connected React clients to update the Leaflet map overlay colors.

Constraint Checklist for AI Execution:

[ ] Are we using uv exclusively for Python packages?

[ ] Are all API keys handled via the .env file?

[ ] Is the map implemented using Leaflet with CRS.Simple (NO Google Maps)?

[ ] Are WebSockets natively handling real-time push notifications?

Begin execution at Phase 1.