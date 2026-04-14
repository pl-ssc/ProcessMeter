# UI Migration Plan

## Goal

Bring the entire frontend to a single UI architecture based on shadcn components, a unified `tsx` component layer, and alias-based imports.

## Target Contract

- All UI primitives live in `frontend/src/components/ui` as `tsx` components.
- All UI imports use `@/components/ui/...`.
- Shared class merging uses `frontend/src/lib/utils.ts`.
- Overlay primitives (`dialog`, `sheet`, `dropdown-menu`, `tooltip`, `select`) follow one shadcn contract.
- Business screens can migrate incrementally, but the UI foundation must have a single source of truth.

## Phase 1. UI Foundation

Scope:

- Fix and document the migration plan.
- Make `tsx` versions canonical for duplicated primitives.
- Keep compatibility wrappers for legacy `jsx` imports during the transition.
- Keep business logic untouched.

Files:

- `frontend/src/lib/utils.ts`
- `frontend/src/lib/utils.js`
- duplicated primitives in `frontend/src/components/ui`

Done criteria:

- `button`, `input`, `separator`, `skeleton`, and `tooltip` resolve to one implementation.
- legacy `jsx` imports still work.
- the frontend builds without changing feature behavior.

## Phase 2. Overlay Layer

Scope:

- Unify `dialog`, `sheet`, `dropdown-menu`, `select`, `tooltip`, and related portal behavior.
- Restore a stable `Sheet` implementation and use it as the canonical side-panel primitive.

Functional risk:

- User forms
- action menus
- role switcher
- focus trap, `Escape`, outside click behavior

## Phase 3. App Shell

Scope:

- Migrate `Header`, `AdminView`, and sidebar/navigation primitives to the unified UI layer.

Functional risk:

- role switching
- mobile sidebar
- top navigation
- logout and layout state

## Phase 4. Admin Screens

Scope:

- Migrate user management, dictionaries, SMTP, imports, and related forms to the unified primitives.

Functional risk:

- user creation/editing
- role rules
- Excel import visibility
- dual-role users in both tables

## Phase 5. Analytics UI

Scope:

- Migrate analytics filters, tabs, tables, and process scope indicators.

Functional risk:

- process filters
- multi-select behavior
- empty and loading states

## Phase 6. Respondent Flow

Scope:

- Migrate respondent-facing panels, dialogs, and controls last.

Functional risk:

- autosave
- dirty state confirmations
- process switching
- completion flow

## Phase 7. Cleanup

Scope:

- Remove obsolete `jsx` duplicates.
- Normalize imports to `@/components/ui/...`.
- Keep only one UI contract in the repository.

## Delivery Order

1. UI Foundation
2. Overlay Layer
3. App Shell
4. Admin Screens
5. Analytics UI
6. Respondent Flow
7. Cleanup
