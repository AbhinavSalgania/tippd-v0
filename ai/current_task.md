## Goals
1) Add a proper sorting control for “Recent shifts” with these options:
- Most recent (default)
- Oldest
- Highest net tips
- Lowest net tips
- Highest tip %
- Lowest tip %
- Highest sales
- Lowest sales

2) Make the sorting control feel clean, modern, and consistent with the rest of the UI.
- Should be obvious what is being sorted and what the current selection is.
- Should not visually overwhelm the page.
- Should work well on mobile (responsive).
- Should not cause layout jump when toggled.

3) Clarify tip % metrics and the breakdown UX.
- Right now “Collected tip %” and “Net after tip-outs” reads confusing and the breakdown panel repeats numbers without context.
- Rename/restructure labels so a user instantly understands:
  - what % is before tip-outs vs after tip-outs
  - what “net tips” means (after tip-outs)
  - which line items are deductions vs additions
- Improve the breakdown layout to be scannable:
  - clear section headers (e.g., “Before tip-outs”, “Tip-outs”, “After tip-outs”)
  - consistent sign handling (avoid mixing red negatives with ambiguous labels)
  - show a short “how it’s computed” hint via tooltip/help icon (keep it subtle)
  - avoid redundancy (don’t show the same number in multiple places unless there’s a reason)

4) Keep changes minimal + safe.
- Do not refactor unrelated screens.
- Prefer small, localized components.
- Do not rewrite entire files. Provide focused diffs/snippets.
- Ensure the existing data model stays intact; only adjust presentation + sorting logic.
- Preserve current styling system (Tailwind/shadcn if already used).

## Implementation Notes (you decide specifics)
- Sorting should be applied client-side to the already-loaded “recent shifts” array (unless you find a clear existing query pattern that should be extended safely).
- The selected sort option should persist during the session (e.g., local state; localStorage optional if trivial).
- If the breakdown is currently shown inline beneath the list, consider a cleaner interaction pattern (e.g., an accordion row expansion, a side panel, or a modal) so the list stays readable.
- Tip % should be presented with explicit labels like:
  - “Tip rate (before tip-outs)” or “Collected tip % (before tip-outs)”
  - “Tip rate (after tip-outs)” or “Net tip % (after tip-outs)”
  Use whichever naming matches the underlying calculations, but make it unambiguous.


## Acceptance Criteria
- A single sorting control exists above “Recent shifts” and includes all requested sort modes.
- Sorting visibly changes the ordering correctly for each mode (net tips, tip %, sales, date).
- Tip % labels are unambiguous and match the displayed values.
- Breakdown reads like a mini statement: easy to understand in <5 seconds.
- No noticeable layout shift/glitch when changing sort or opening/closing breakdown.
- No broken types/build; lint passes.

## Deliverables
- Brief summary of what you changed and why.

- If you introduce a helper (e.g., compare functions), keep it small and colocated unless there is an existing utilities pattern.

Proceed by:
1) locating the component that renders the Recent shifts list and breakdown
2) implementing the sort control + sort logic
3) revising the tip % labeling + breakdown UI structure
4) sanity-checking the list on desktop + mobile widths