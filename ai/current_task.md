# Current Task: Redesign Manager Dashboard (Today’s Service Workflow)

## Goal
Redesign the Manager Dashboard into a fast, daily “Today’s service” workflow screen,
without breaking existing manager routes (Entries / Summary / Kitchen)
and without changing payout logic.

## Context
- Supabase tables in use:
  - service_periods
  - shift_assignments
  - service_period_entries
  - employees
- Manager currently lands on a dashboard with cards/links only.
- There is an existing working “Entries” flow for a selected service period.
- Reuse as much logic/components from the Entries flow as makes sense.

## What the New Manager Dashboard Should Do

### Date & Period Selection
- Show today’s date prominently at the top.
- Include a date picker to change day.
- Allow selecting period type (lunch / dinner).
- Default to:
  - a reasonable heuristic for “current likely period”, or
  - lunch if unsure.
- Load the service period for the selected date + type.
- Do NOT auto-create service periods.
- Only create a period if the manager explicitly clicks “Create period”.

### Scheduled Staff
- Show only staff scheduled for the selected date + period.
- Pull from shift_assignments joined with employees.
- Add a search box to filter by name or code.
- Present staff in a clean, manager-friendly layout.
- Grouping preference:
  - Group by role (Servers / Bartenders),
  - Then by station (Dining / Patio / Bar / Lounge, etc),
  - Or another grouping that reads best based on available data.

### Per-Staff Entry
For each scheduled staff member:
- Enter:
  - Sales total
  - Tips collected
- Do NOT ask for bartender slot input.
- Derive bartender count from assignments (same as current logic).

### Actions
- “Save entries”
  - Upsert only rows where both fields are filled.
  - Do NOT create empty rows.
- Optional: “Compute & Publish”
  - Only if a period exists and entries are valid.
  - Can link to or reuse existing publish flow.
- Validation rules must match current Entries page:
  - Missing values
  - Negative numbers
  - Bartender count must be 1 or 2

## UX Expectations
- Feels like a daily checklist.
- Optimized for fast daily entry.
- Responsive layout.
- Avoid heavy tables if cards/lists read better.
- Show helper text like:
  - “Scheduled staff for Tue Jan 21 (Dinner)”
- Clearly label stations.
- If no assignments exist:
  - Show a helpful empty state
  - Suggest next steps (Entries page or assignments view)
  - make sure that when manager logs in they land on this new dashboard and it is not confusing with the other dashboard
  - have an way for manager to navigate back to home page. 

  this new dashboard is basically the home page.


## Engineering Constraints
- Reuse existing data-fetching and upsert logic from:
  - /manager/entries
- Do NOT change payout calculation logic.
- Do NOT introduce Supabase Auth migration.
- Keep changes localized to manager dashboard route/components.
- Minimal collateral changes.

## Acceptance Criteria
- /manager shows today by default.
- Only staff scheduled for that period appear.
- Date and period changes update staff list correctly.
- Manager can enter sales/tips, save, and publish.
- Staff dashboards reflect payouts correctly.
- No empty rows created on page load.