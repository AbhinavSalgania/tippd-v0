## Current Task: Fix Manager Navbar UI Stability

### Goal
Fix the Manager navbar UI so it is visually consistent and stable across all
manager pages (Service Day, Entries, Summary, Kitchen).

The current navbar has layout shifts when switching tabs:
- Pills change size or spacing when active
- Header height differs between pages
- The overall interaction feels janky and unsmooth

### Requirements
- Identify and fix the root cause(s) of layout shift (e.g. active styles,
  font-weight changes, padding/border differences, missing gaps, or
  page-specific header wrappers).
- Refactor to a single shared manager header/nav component if needed.
- Ensure nav items have identical dimensions in active and inactive states.
- Preserve the existing visual style (black pill for active tab).
- Improve hover, active, and focus states for a smooth, polished feel.
- Ensure keyboard accessibility and responsive behavior.

### Constraints
- Do NOT modify payout, compute, or business logic.
- Do NOT redesign unrelated UI.
- Provide summary of changes made
- If files are renamed or components are shared, update imports cleanly.

### Definition of Done
- Switching between manager pages causes zero layout shift.
- Header height and spacing are identical on all manager pages.
- Nav interaction feels smooth and intentional.