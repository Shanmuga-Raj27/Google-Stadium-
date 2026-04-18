# MISSION: Global Codebase Syntax Audit & Stabilization

**Role:** Senior QA Engineer & Code Reviewer
**Context:** The "Google Stadium v2" project recently experienced Vite build crashes due to JSX `[PARSE_ERROR]` issues (e.g., returning multiple sibling elements without a parent fragment in conditional renders). We need a comprehensive audit of the entire codebase to catch and fix any remaining syntax errors, formatting inconsistencies, or structural bugs.

**Scope:** Both `frontend/` (React/Vite) and `backend/` (FastAPI/Python).

**Execution Checklist:**

### PHASE 1: Frontend Syntax & JSX Audit (React)
1. **JSX Structural Integrity:** Scan all `.jsx` files (especially `FanDashboard.jsx`, `VendorDashboard.jsx`, and `AdminDashboard.jsx`). Ensure all components, conditional renders (ternary operators), and `.map()` functions return a *single* valid parent element (using `<></>` fragments or `<div>` wrappers where necessary).
2. **Hook Rules:** Verify that all `useEffect`, `useState`, and other hooks are called at the top level and have proper dependency arrays. Ensure all WebSocket connections return a safe cleanup function `() => ws.close()`.
3. **Import/Export Cleanup:** Remove any unused imports and ensure all components are properly exported.

### PHASE 2: Backend Syntax & Async Audit (FastAPI)
1. **Python Syntax:** Scan all `.py` files. Check for missing colons, incorrect indentation, unclosed parentheses, or malformed dictionaries/lists.
2. **Async/Await Integrity:** Ensure every database call (`db.execute`, `db.commit`) and asynchronous function is properly awaited. Catch any synchronous code blocking the async event loop.
3. **Exception Handling:** Verify that all `try...except` blocks are structurally sound and safely rollback database sessions (`await db.rollback()`) on failure.

### PHASE 3: Code Cleanliness & Readability
1. **Formatting:** Standardize indentation (4 spaces for Python, 2 spaces for JS/React).
2. **Dead Code:** Remove any commented-out testing code, console logs (except error logs), or leftover testing buttons (like "Ping A / Ping B").
3. **Comments:** Add brief, professional comments above complex logic blocks (like WebSocket routing or JWT hashing) to improve future readability.

**CRITICAL CONSTRAINTS:**
* **DO NOT** change, remove, or rewrite any existing business logic or database schemas. 
* **ONLY** fix syntax, structural errors, and formatting.
* Provide a brief summary of the exact files and lines where broken syntax was found and fixed.