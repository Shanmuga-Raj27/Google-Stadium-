# Walkthrough: Google Stadium Initialization

The initial build of the smart stadium platform has been completed successfully! Here is a review of what was accomplished over the four requested phases.

> [!TIP]
> The application uses purely raw PostgreSQL connections (via `asyncpg`), bypassing heavy ORMs, while simultaneously keeping WebSocket logic entirely native.

## 🏗️ Architecture

We enforced the exact desired repository structure:
- **`google-stadium/.env`**: Base secret configurations.
- **`google-stadium/backend/`**: Scaffolded using `uv`. Core dependencies including `fastapi`, `sqlalchemy`, `asyncpg`, and `websockets` were installed rapidly.
- **`google-stadium/frontend/`**: Vite + React initialized directly without clutter, augmented with `react-router-dom` and `react-leaflet`. Tailwind CSS v4 handles standard styling globally.

## 🔌 Backend Services

1. **Async Database Engine**: Initialized efficiently in `database.py`.
2. **Models**: Constructed strict declarative models for `User`, `Order`, and `LocationPing`. Tables auto-create on startup via the `lifespan` context manager.
3. **WebSocket Manager**: A robust `ConnectionManager` class in `./app/main.py`. It enables:
    - **Broadcasts:** Emitting map updates to all fans.
    - **Targeted Notification:** `send_personal_message()` precisely pings specific vendor user connections when their respective orders are validated.

## 🗺️ Visual Interface & Leaflet CRM

The React frontend handles views seamlessly:
- **StadiumMap**: Used `L.CRS.Simple` mapping exactly as requested. We successfully generated a custom architectural placeholder image (`stadium-blueprint.jpg`), overlaid with non-geographic `[x, y]` dynamic Leaflet markers.
- **Fan Dashboard (`/fan`)**: Simulates heatmap density generation and renders real-time queueing. Users can instantly push food orders causing an alert cycle on the vendor side.
- **Vendor Dashboard (`/vendor`)**: Features an animated live WebSocket listener, pushing immediate alerts to the stack utilizing deep React state propagation.

## 🏁 How to Run

When you're ready to deploy services locally, boot them up as follows:

**Backend (Python)**:
```bash

cd google-stadium/backend

.venv\Scripts\activate
uvicorn app.main:app --reload

```

**Frontend (React)**:
```bash

cd google-stadium/frontend
npm run dev

```


## 🌌 Global UI Overhaul & Live WebSockets

To elevate the stadium experience, we introduced comprehensive modernizations combining React Context dynamics with fully duplex WebSocket bindings:

1. **Global Chat Widget (`/ws/chat/{id}`)**: Built a floating interactive widget available across all protected routes. WebSockets instantly decode and broadcast payloads, utilizing real-time rendering. Admin messages are structurally highlighted via native React component states (`font-bold text-googleRed`).
2. **Persistent Sidebar Layout**: Restructured component boundaries to wrap all Fan/Vendor/Admin dashboards inside `<SidebarLayout>`. This layout introduces clean navigation maps out of the gate with intuitive Light/Dark toggles.
3. **Tailwind v4 `@theme` Overhauls**: Configured global `ThemeContext` tracking raw DOM node mutations to natively toggle `class="dark"` over HTML rendering paths, paired with official Google Hex values globally configured under `@theme` inside Vite's Tailwind engine.
4. **Interactive Fan Dashboard Heatmap**: Embedded an immediate gate density UI layout showcasing Gate A/B/C traffic via CSS `snap-x` overflow containers dynamically wrapped in structural color schemas.
5. **Robust Local State**: Bound order socket streams to conditionally route via standard `NEW_ORDER` and `ORDER_READY` identifiers smoothly so the Fan dashboard triggers UI flashes on state transitions gracefully without refresh limits.

python scripts/reset_db.py
