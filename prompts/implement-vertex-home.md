# Implement Vertex Home Page

## Goal

Replace the starter homepage at `/` with a faithful responsive implementation of `design/vertex-home.png`, while preserving the existing `/design-system` route and its showcase.

## Current state

- `app/page.tsx` is the default Next starter page.
- `app/design-system/page.tsx` contains the existing Vertex design-system showcase and must not be changed.
- `app/globals.css` contains the shared Vertex tokens and design-system styles.
- `app/layout.tsx` already has Vertex metadata and uses the shared global stylesheet.
- The reference is a light, warm-white Vertex learning platform landing page with a centered desktop canvas, subtle diagonal side texture, orange accents, serif display type, and navy body text.

## Implementation

- Build the homepage in `app/page.tsx` with reusable local components for the header, Vertex mark, icon buttons, search field, course cards, metadata rows, and footer activity bars.
- Keep the page static and self-contained. Do not add Sanity, Clerk, API, search backend, or progress functionality for this visual implementation.
- Recreate the reference composition:
  - Header with Vertex logo/mark, Courses and My Learning links, notification icon, and circular profile image treatment. Use a local CSS/SVG avatar approximation; do not add an external image dependency.
  - Hero badge “INTELLIGENT LEARNING”, large two-line serif headline “Search your learning in plain English.”, supporting copy, orange “Explore Courses” CTA, and wide search field with search icon and `⌘ K` keycap.
  - Courses section with “All Courses”, “View all courses →”, and three cards: Next.js for Production, Docker Essentials, and TypeScript Deep Dive. Each card includes a visual course mark, description, divider, level, duration, and module count.
  - Bottom callout with star icon and “New courses and lessons added every week.” plus the translucent orange stepped bar artwork shown in the reference. Build the bars with CSS gradients/opacity rather than generating a raster asset.
- Use inline SVG/CSS icons and the existing Vertex orange/neutral tokens. Do not install an icon package.
- Make CTA, nav links, and the search field real accessible elements with visible hover/focus-visible states. The search field may be presentational and need not submit.
- Preserve the reference’s generous whitespace, panel border lines, warm background, rounded course cards, typography hierarchy, and desktop proportions. On narrow widths stack cards, wrap header navigation sensibly, and scale the hero without clipping or page-level horizontal overflow.

## Files expected to change

- `app/page.tsx`: implement the homepage.
- `app/globals.css`: add homepage-scoped layout, hero, course-card, texture, and footer-art styles without regressing `.design-system`.

Do not modify `app/design-system/page.tsx` or add unrelated routes.

## Acceptance criteria

- `/` matches the supplied reference in hierarchy, spacing, colors, typography, card content, controls, and decorative treatment.
- `/design-system` remains unchanged and functional.
- No starter copy or Next/Vercel logos remain on `/`.
- Homepage is responsive below 768px and has no unintended horizontal overflow.
- Interactive elements are keyboard accessible and have visible focus states.

## Checks

- Run `bun run lint`.
- Run a focused TypeScript check for `app/page.tsx`.
- Run `git diff --check` for files changed by this request.
- Run `bun run dev` and smoke-test `/` and `/design-system` at desktop and mobile widths.
