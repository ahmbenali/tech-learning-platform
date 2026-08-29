# Move Vertex Design System to Its Own Route

## Goal

Move the implemented Vertex design-system showcase from the homepage to `/design-system`, while restoring `app/page.tsx` exactly to its original Next.js starter content.

## Decisions

- Keep the existing design-system markup and styling unchanged.
- Create `app/design-system/page.tsx` containing the current showcase implementation.
- Restore `app/page.tsx` from `HEAD` so the original homepage remains intact.
- Keep the design-system CSS in `app/globals.css`, since it is globally loaded and scoped primarily through `.design-system`.
- Do not add redirects, navigation links, backend behavior, or unrelated visual changes.

## Acceptance criteria

- `/` renders the original starter homepage.
- `/design-system` renders the existing Vertex design-system page.
- The design-system route builds with the same metadata/layout and retains responsive behavior.
- No design-system content remains in `app/page.tsx`.

## Checks

- Run `bun run lint`.
- Run a focused TypeScript check for the changed route files.
- Run `git diff --check`.
