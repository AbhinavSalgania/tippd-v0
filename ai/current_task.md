# Task: Add Time Scope Selector to Employee Dashboard Summary

## Context
The employee dashboard shows take-home earnings and summary metrics
based on already-loaded FOH payout data.

We want to add a time scope selector next to “Take-home earnings”
to let users view metrics for different periods.

## Scope Options
- Today
- Yesterday
- This month
- Last month
- Total (default)

## Behavior
- The selector controls all summary metrics in the top section
  (take-home earnings, per-shift average, tip rates, sales context).
- Switching scope updates numbers instantly without page reload.
- No new database queries or backend changes.
- Operate only on the already-loaded payout data in memory.

## UI Guidance
- Use a segmented control / pill-style button group (not a dropdown).
- Place it visually aligned with the “Take-home earnings” header.
- The active scope should be clearly indicated.
- Avoid layout shift when switching scopes.

## Constraints
- Do NOT modify payout or calculation logic.
- Do NOT introduce new Supabase queries.
- Do NOT refactor data loading.
- Keep changes localized to the dashboard component.

## Implementation Notes (you decide specifics)
- You may introduce a `timeScope` state (e.g. 'today' | 'yesterday' | 'month' | 'last-month' | 'total').
- Filter payouts by `service_periods.period_date`.
- Reuse existing computed summaries where possible.
- If a scope has no data, show a calm empty state (not an error).

## Acceptance Criteria
- User can clearly tell which time scope is active.
- Numbers update correctly when switching scopes.
- “Total” matches current behavior exactly.
- No regressions in Recent Shifts or breakdown logic.

## Deliverables
- Brief summary of changes.
- Minimal diffs.
- Manual test checklist (visual + date sanity check).