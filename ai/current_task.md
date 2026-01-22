# You are a senior front-end engineer improving the Manager “scheduled staff” page UI in a Next.js (App Router) + Tailwind app.

## Goal: 

improve hierarchy + clarity while keeping logic intact. Do NOT change database schema or tip math. Only UI/layout components and small view-model shaping if needed.

## Important constraints:
- Prefer minimal diffs. Do NOT output entire file contents. Only show the exact changed snippets (before/after or patch-style).
- Preserve existing behavior: past dates are view-only; editing happens via Entries page.
- Keep accessibility reasonable (labels, button semantics).
- Keep styling consistent with existing app styles.

## Scope (implement all):

1) Date header redesign + “Past date” badge (Option B)
- In the page header, make the date the primary visual element (bigger font, strong weight).
- Display the shift label (e.g., “Dinner”) as a subtle pill next to the date (if shift exists).
- If the currently viewed date is in the past (the same condition you already use to show view-only mode), show a subtle badge near the date:
  - Text: “Past date”
  - Style: small, rounded, light background (e.g., bg-amber-50) + amber text/border, not a big banner.
- Remove (or significantly demote) the large yellow banner. Replace it with either:
  - nothing besides the badge, OR
  - a small one-line helper under the header: “Editing disabled — use Entries to edit past days.” with a link to Entries.
  Choose whichever looks cleanest, but the badge is required.

2) Tips indicator with subtle 💰
- In every employee row where tips are displayed, add a subtle “💰” indicator next to Tips.
- It should not be loud: small, slightly muted (e.g., opacity-70 or text-gray-500).
- If a row is editable, keep the existing input/interaction behavior; just add the icon next to the Tips label/value.
- If the UI currently shows columns (“Sales ($)”, “Tips ($)”), add the 💰 near “Tips ($)” header and/or near each row’s tips value. Minimum requirement: show 💰 next to each row’s tips value.

3) Layout tweaks to reduce “spreadsheet” feel (without changing data)
- Prefer showing employee name as primary; code is secondary.
- If it’s currently “B002 · Bartender 2”, switch to “Bartender 2” as primary line, “B002” as small muted meta.
- Keep grouping by Role and Location, but upgrade section headers:
  - Make group header a compact band (bg-gray-50, rounded) with: “Bartenders · Bar 1” and a count pill “(1)”.
  - Reduce excessive vertical whitespace between groups (tighten padding/margins).

Implementation details:
- Find the component/page that renders this manager schedule view (likely under app/manager/... maybe ManagerEntriesClient or a schedule page).
- Identify where “past date view-only mode” is determined; reuse that boolean for the badge.
- Implement Tailwind changes directly in JSX; avoid adding new UI libraries.
- Ensure the search box and “Entries page” button remain in the header area, aligned nicely (flex layout, responsive).
- Keep mobile in mind: header should stack nicely (date row, then actions row).

## Deliverables:
- Provide the minimal diff for the file(s) changed.
- Briefly explain where the date header, badge, and tips 💰 were added, and what Tailwind classes were used.
- Do not include unrelated refactors.

## Acceptance checks:
- When viewing a past date, the badge “Past date” appears beside the date and the big yellow banner is gone/demoted.
- Tips values visibly include a subtle 💰 indicator.
- Employee rows show name primary, code secondary.
- No logic regressions; page still loads and groups correctly.