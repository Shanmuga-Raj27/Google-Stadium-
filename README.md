# 🏟️ Google Stadium: Smart In-Stadium Delivery & Management

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)

Google Stadium is a comprehensive, real-time web application designed to revolutionize the live event experience. It bridges the gap between stadium fans, food vendors, and administration by providing seamless seat-delivery food ordering, interactive live maps, crowd traffic monitoring, and global stadium communication.

## 🤖 Development Philosophy

> **Note:** This app is fully developed using **Google Antigravity** through advanced prompt engineering. The entire development lifecycle utilized an Agile methodology—focusing on iterative, small-scale improvements, rapid prototyping, and efficient AI-assisted debugging.

The prompts, architectural decisions, and AI implementation details are preserved in the `Antigravity Prompt/` directory for educational and structural reference.

---

## ✨ Key Features

### 🌭 For Fans
* **Smart Food Ordering:** Browse stadium vendors, order food, and get it delivered directly to your exact seat or a nearby custom location.
* **Live Order Tracking:** Real-time status updates from kitchen preparation to delivery.
* **Interactive Stadium Map:** Navigate the stadium with a custom visual map.
* **Gate Traffic Status:** Check live crowd density at different gates to avoid long lines.

### 🏪 For Vendors
* **Menu Management:** Easily publish, update, and manage food items.
* **Order Processing Dashboard:** Accept, prepare, and dispatch orders directly to fan seats.
* **Financial Analytics:** Track wallet balance, total revenue, profit margins, and complete order history.

### 🛡️ For Administrators
* **Traffic Control:** Monitor and manually update gate traffic statuses to guide crowds.
* **Map Customization:** Dynamically update the interactive stadium map.
* **Global Announcements:** Broadcast live, stadium-wide announcements to all active users via the chat system.

### 💬 Global Community
* **Live Stadium Chat:** A global, real-time WebSocket chat room available for all fans, vendors, and admins to communicate during the event.

---

## 🛠️ Tech Stack

* **Frontend:** ReactJS, Vite, Tailwind CSS
* **Backend:** Python, FastAPI, WebSockets (for real-time chat & tracking)
* **Database:** PostgreSQL (via SQLAlchemy / Asyncpg)
* **Package Manager (Python):** `uv` - An extremely fast Python package and project manager.
* **Deployment:** Render (Hosting for both Static Site and Web Service)

---

## 📂 Folder Structure

```text
Google Stadium/
│
├── Antigravity Prompt/          # 🧠 Contains all AI prompts (.md) and implementation details
│
└── google-stadium/              # 💻 Main Application Codebase
    │
    ├── frontend/                # ReactJS Application
    │   ├── public/              # Static assets and _redirects
    │   ├── src/                 # React components, pages, and context
    │   └── package.json         # Node dependencies
    │
    └── backend/                 # FastAPI Application
        ├── app/                 # Routers, Models, Schemas, and Database logic
        ├── requirements.txt     # Python dependencies
        └── .env                 # Environment variables (Ignored in version control)
