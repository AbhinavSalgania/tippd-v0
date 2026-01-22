# Task Context: Manager Dashboard Redesign

## Read First
- rules.md
- current_task.md
- scriptReferences.md


## File Scope
Agent should internally determine and respect:
- Primary files (directly modified)
- Reference files (logic reused, not rewritten)
- Supporting files (read-only unless strictly necessary)

Updated file scope:
- Primary files: app/components/AppHeader.jsx, app/globals.css, app/manager/ManagerContentTransition.jsx, app/manager/ManagerDashboardClient.jsx, app/manager/entries/ManagerEntriesClient.jsx, app/manager/summary/page.jsx, app/manager/compute/ManagerComputeClient.jsx, app/manager/kitchen-hours/page.jsx, app/manager/kitchen-weekly/page.jsx, app/manager/assignments/[servicePeriodId]/page.jsx
- Reference files: None
- Supporting files: ai/rules.md, ai/current_task.md, ai/scriptReferences.md

## Notes
## Product Context
Tippd is a manager-facing tip transparency and payout tool for restaurants.
Managers use it daily to enter sales/tips for a service period and compute payouts
for front-of-house and kitchen staff.
