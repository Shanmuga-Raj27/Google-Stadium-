# 🏟️ Google Stadium: Smart In-Stadium Delivery & Management

**Official Submission for Google PromptWars: Virtual (2026)**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)

**Google Stadium** is a real-time, full-stack web application designed to revolutionize the live event experience. It solves the massive logistical headaches of stadium crowds by providing seat-delivery food ordering, interactive crowd mapping, and global stadium communication.

🔗 **[Experience the Live App Here](https://google-stadium-app.onrender.com)** *(Note: Please allow 30-50 seconds for the free-tier backend server to spin up on your first request).*

---

## 🤖 Built with Google Antigravity

This entire full-stack architecture was conceptualized, coded, and debugged using **Google Antigravity**. 

**The Agile Prompting Workflow:**
Rather than attempting a "one-shot" generation, this project was built using an Agile methodology with AI. The development lifecycle consisted of:
1. **Architectural Planning:** Defining the database schema and WebSocket requirements first.
2. **Iterative Feature Sprints:** Prompting for small, isolated components (e.g., Fan ordering logic, then Vendor dashboards, then Live Chat).
3. **Surgical Debugging:** Feeding Vite/Uvicorn terminal errors back into Antigravity for highly specific, scoped fixes (e.g., resolving Render deployment driver issues).

📂 **The Prompt Vault:** To demonstrate the exact prompt engineering techniques used, the complete history of instructions, architectural constraints, and error-correction loops are documented in the `Antigravity Prompt/` directory.

---

## ✨ The Solution: Key Features

### 🌭 The Fan Experience
* **Seat-Direct Ordering:** Browse stadium vendors and get food delivered exactly to your block, row, and seat.
* **Live Status Tracking:** Real-time updates from kitchen preparation to delivery.
* **Interactive Map & Traffic:** View the stadium layout and check live crowd density at different gates to avoid long lines.

### 🏪 The Vendor Experience
* **Order Radar:** Accept, prepare, and dispatch orders directly to fan seats via a real-time dashboard.
* **Financial Analytics:** Track wallet balances, total revenue, profit margins, and complete order histories.
* **Menu Control:** Dynamically publish and update food items.

### 🛡️ Administration & Global Comms
* **Global Live Chat:** A stadium-wide WebSocket chat room for fans to interact during the event.
* **Admin Megaphone:** Administrators can broadcast pinned, stadium-wide announcements.
* **Traffic Control:** Admins can manually update gate traffic statuses to safely guide crowds.

---

## 🛠️ System Architecture & Tech Stack

* **Frontend:** ReactJS, Vite, Tailwind CSS (Mobile-First Google Material Design)
* **Backend:** Python, FastAPI, WebSockets (For real-time chat & order updates)
* **Database:** PostgreSQL (via SQLAlchemy / Asyncpg)
* **Auth:** Secure JWT Implementation

### Folder Structure
```
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
```

## ☁️ Cloud Deployment Architecture

The application is fully deployed and hosted on **Render**, utilizing a modern, decoupled cloud architecture:

* **Managed Database:** A Render PostgreSQL instance handles all users, menus, and transactional order data.
* **Backend Web Service:** The FastAPI backend is deployed on a Python 3 environment. It uses `uvicorn` to serve the RESTful API and maintain persistent WebSocket connections for the live chat.
* **Frontend Static Site:** The React app is built with Vite and served globally via Render's CDN. It utilizes a `_redirects` configuration to ensure seamless Single Page Application (SPA) routing, and dynamically links to the backend via secure environment variables (`import.meta.env`).

---

## 📖 The PromptWars Narrative

* 📝 **[Read the Technical Blog Post](YOUR_BLOG_LINK_HERE)** - A deep dive into how I used Antigravity to solve full-stack deployment challenges.
* 💼 **[View the Build-in-Public Journey](YOUR_LINKEDIN_LINK_HERE)** - My updates and learnings shared with the developer community.

---

**Developer:** Shanmugaraj R  
**LinkedIn:** [Add your LinkedIn URL here](YOUR_LINKEDIN_URL)  
**GitHub:** [Add your GitHub URL here](YOUR_GITHUB_URL)
