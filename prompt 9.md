# TASK: Emergency JSX Fix in FanDashboard

**Role:** Senior React Debugger
**Context:** The Vite compiler is hard-crashing with a `[PARSE_ERROR]` in `frontend/src/pages/FanDashboard.jsx` at line 115.

**The Error:**
`[PARSE_ERROR] Error: Expected ',' or ')' but found 'Identifier'`
The error is occurring right after `) : (` at the `<h2 className="text-3xl...>{activeVendor.vendor_profile?.store_name...} Menu</h2>` tag.

**The Cause & Solution:**
You are returning multiple sibling JSX elements inside the false branch of a ternary operator. In React, a ternary branch MUST return a single parent element. 

**Instructions:**
1. Open `frontend/src/pages/FanDashboard.jsx`.
2. Locate the ternary operator that checks if an `activeVendor` is selected.
3. Wrap the `<h2 ...>` tag **AND** the sibling `<div>` that contains the mapped menu items inside a React Fragment `<></>`.
   *Example:*
   ```jsx
   ) : (
     <>
       <h2 className="...">...</h2>
       <div className="grid...">...</div>
     </>
   )