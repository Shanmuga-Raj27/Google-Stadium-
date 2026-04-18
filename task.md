# Task List: Google Stadium

## Phase 1: Environment & Secrets Setup
- [x] Create root `.env` file with `DATABASE_URL` and `PORT`.
- [x] Create `google-stadium/backend/` directory.
- [x] Initialize Python virtual environment with `uv venv`.
- [x] Install FastAPI backend dependencies using `uv pip install`.
- [x] Freeze requirements to `requirements.txt`.
- [x] Create `google-stadium/frontend/` directory.
- [x] Scafffold Vite React frontend using `npm create vite@latest`.
- [x] Install Frontend dependencies using `npm install`.

## Phase 2: Database & Backend Scaffolding
- [x] Set up asynchronous SQLAlchemy engine in `backend/app/database.py`.
- [x] Create raw SQLAlchemy models (`User`, `Order`, `LocationPing`) in `backend/app/models.py`.
- [x] Initialize FastAPI app and implement WebSocket connection manager in `backend/app/main.py`.

## Phase 3: Frontend Scaffolding & Indoor Map
- [x] Define React routing in `App.jsx` (`/fan`, `/vendor`, `/admin`).
- [x] Write reconnecting WebSocket client in `frontend/src/services/websocket.js`.
- [x] Implement `StadiumMap.jsx` using `React-Leaflet`, `L.CRS.Simple`, and `ImageOverlay`.

## Phase 4: Core Workflows (Integration)
- [x] Implement REST `POST /orders` endpoint mapping to Vendor dashboard WS ping.
- [x] Implement Heatmap loop/endpoint for zone density WS broadcast.
- [x] Final UI styling and visual verification.
