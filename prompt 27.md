# TASK: Surgical Syntax Fix (Vite Parse Errors)

**Role:** Senior React Debugger
**Context:** The Vite build is failing due to two specific syntax errors injected during the last update. You must surgically fix these exact lines without altering any other logic, layout, or CSS in the files.

**Execution Instructions:**

### 1. Fix `VendorDashboard.jsx` (Stray Character)
* **The Error:** `[PARSE_ERROR] Expected a semicolon... near "i  return ("`
* **The Fix:** Locate the `return` statement around line 163. Remove the stray `i` character that was accidentally placed before `return`. It must be a clean `return (`.

### 2. Fix `FanDashboard.jsx` (Malformed JSX Ternary)
* **The Error:** `[PARSE_ERROR] Unexpected token near "{!activeVendor ? ("`
* **The Fix:** Locate this line around line 405. The ternary operator is either missing its false branch (`:`) or missing its closing brace `}`. 
* Audit the JSX block. Ensure that if `{!activeVendor ? ( ... ) : ( ... )}` is used, both parentheses and the closing brace are perfectly matched. If it was meant to be a simple conditional, change it to `{!activeVendor && ( ... )}` and ensure the closing tag is present.

**Constraints:** Do NOT rewrite the rest of the file. Do NOT change the UI. ONLY fix these two specific syntax typos so the Vite server can compile successfully.