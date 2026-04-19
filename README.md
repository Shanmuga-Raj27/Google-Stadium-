☁️ Cloud Deployment Architecture
The application is fully deployed and hosted on Render, utilizing a modern, decoupled cloud architecture:

Managed Database: A Render PostgreSQL instance handles all users, menus, and transactional order data.

Backend Web Service: The FastAPI backend is deployed on a Python 3 environment. It uses uvicorn to serve the RESTful API and maintain persistent WebSocket connections for the live chat.

Frontend Static Site: The React app is built with Vite and served globally via Render's CDN. It utilizes a _redirects configuration to ensure seamless Single Page Application (SPA) routing, and dynamically links to the backend via secure environment variables (import.meta.env).

📖 The PromptWars Narrative
📝 Read the Technical Blog Post - A deep dive into how I used Antigravity to solve full-stack deployment challenges.

💼 View the Build-in-Public Journey - My updates and learnings shared with the developer community.


### Final Touches Before Submitting:
1. Make sure to replace `YOUR_BLOG_LINK_HERE` and `YOUR_LINKEDIN_LINK_HERE` at the very bottom with your actual links before you submit to the judges.
2. Once this is pasted into GitHub, it acts as a perfect portfolio piece, not just for the hackathon, but for your future interviews at places like Zoho! 

You are completely ready to submit. Good luck in the PromptWars!
