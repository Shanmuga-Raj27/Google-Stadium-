# Google Stadium Initialization & Development

This plan outlines the initialization and integration of "Google Stadium," a full-stack real-time application for physical event experiences featuring smart queuing and live crowd wayfinding. The stack involves a Python FastAPI backend leveraging `asyncpg` and WebSockets, alongside a React frontend constructed with Vite and Leaflet for indoor mapping.

## User Review Required

> [!WARNING]
> We will create a strict `google-stadium` directory inside your current workspace. Any existing capitalized `Backend` or `Frontend` folders in your current directory will be ignored/removed to ensure strict adherence to the requested `backend` and `frontend` lowercase directory structure.

## Proposed Changes

---

### Project Root & Environment

- **`.env`**: Global secrets file including placeholders for `DATABASE_URL` (in asyncpg format) and `PORT`.

---

### Backend Components

#### [NEW] `google-stadium/backend/` Directory
- Uses `uv` for python virtual environment management and package resolution.
- Dependencies installed strictly: `fastapi`, `uvicorn`, `sqlalchemy`, `asyncpg`, `pydantic`, `python-dotenv`, `websockets`.
- Freezes precise dependencies into `requirements.txt`.

#### [NEW] `google-stadium/backend/app/database.py`
- Sets up asynchronous SQLAlchemy engine pulling credentials from the raw PostgreSQL URL.

#### [NEW] `google-stadium/backend/app/models.py`
- Implements raw SQLAlchemy classes without ORM overhead abstractions for `User`, `Order`, and `LocationPing`.

#### [NEW] `google-stadium/backend/app/main.py`
- Initializes the FastAPI app.
- Houses a robust `ConnectionManager` class to trace active WebSocket connections, enabling broad JSON broadcasts and targeted (direct-to-client) payload deliveries.

#### [NEW] Routers Scaffolding
- `app/routers/orders.py`, `app/routers/map.py`, `app/routers/auth.py` for distinct REST operations.

---

### Frontend Components

#### [NEW] `google-stadium/frontend/` Directory
- Standard Vite + React template setup.
- Explicitly scoped minimal layout dependencies: `axios`, `react-router-dom`, `leaflet`, `react-leaflet`, `lucide-react`, and standard `tailwindcss` implementation.

#### [NEW] `google-stadium/frontend/src/services/websocket.js`
- Clean, robust WebSocket logic ensuring persistent connections, reconnection strategies, and event bubbling specifically for JSON data (like `ORDER_READY` and `MAP_UPDATE`).

#### [NEW] `google-stadium/frontend/src/components/StadiumMap.jsx`
- Configures `React-Leaflet` to disable geographic coordinate references (`L.CRS.Simple`).
- Uses `ImageOverlay` anchored to a placeholder blueprint image.
- Plots markers atop the image corresponding strictly to dynamically received Cartesian `[x, y]` coordinates.

#### [NEW] Views and Layout
- `App.jsx` handles global `<BrowserRouter>` rendering `/fan`, `/vendor`, and `/admin`.
- Dashboards skeleton UI configured with Tailwind for immediate professional feel emphasizing real-time interaction.

---

### Integration Workflows (Phase 4)

- **Smart Queue Workflow:** `POST /orders` triggers database commit followed immediately and asynchronously by a direct WebSocket ping targeting the specified Vendor's interface.
- **Dynamic Heatmap Loop:** FastAPI background tasks continuously compute zone densities parsing the `LocationPing` model, dispatching zone-based crowdedness broadcasts to live frontend connections.

## Open Questions

> [!IMPORTANT]
> The prompt doesn't specify if we have a real `stadium-blueprint.jpg`. In the absence of one, I will generate a functional, aesthetic blueprint placeholder image utilizing my built-in image generator tool. Are you okay with this approach?

## Verification Plan

### Automated Tests
- Command verification: Backend initializes correctly using `uvicorn app.main:app`.
- Frontend boots cleanly with Vite (`npm run dev`).
- SQLAlchemy correctly auto-creates PostgreSQL schema tables on process bootstrap (or Alembic generation if scaling demands).

### Manual Verification
- We will demonstrate that a Fan dispatching an order directly updates the Vendor's dashboard in real time through WebSockets.
- Simulating map location pings displays real-time density coloring over the generated Leaflet Map plane.
