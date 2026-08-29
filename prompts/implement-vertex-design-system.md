# Implement Vertex Design System

## Goal

Replace the default Next.js starter page with a faithful, responsive implementation of the supplied `design/vertex-designsystem.png` reference. The page is a design-system showcase for Vertex: brand introduction, color tokens, typography, type scale, spacing, radius/shadow tokens, icons, buttons, inputs, badges, statuses, progress, cards, navigation, and principles.

## Context and inspection

- The app is a minimal Next.js 16.3.3 App Router starter.
- The current surface is `app/page.tsx`, with global styles in `app/globals.css` and metadata/fonts in `app/layout.tsx`.
- Tailwind CSS 4 is installed via `@tailwindcss/postcss`; there are no existing Vertex components or design tokens to preserve.
- The reference image is the visual source of truth. It is a light, warm-white canvas with bordered rounded panels, orange Vertex brand accents, dark navy neutrals, Playfair Display-style editorial headings, and Inter-style UI text.
- No design-system skill is needed; this is repo-native HTML/CSS/React UI work. Next App Router conventions and the installed Next version must be respected.

## Implementation requirements

### Page structure

- Build the entire reference as one polished page at `/`.
- Use semantic sections and reusable local React components for panels, section labels, swatches, token rows, buttons, badges, cards, and navigation examples rather than one unstructured markup block.
- Keep all showcase content static and self-contained; no Sanity, Clerk, API, or external data integration is needed for this request.
- Use inline SVG/icon components or another dependency-free icon approach. Do not add an icon package solely for this page.
- Preserve the reference’s dense editorial board composition on desktop while allowing sensible responsive behavior: multi-column sections stack or scroll at narrow widths, cards become single-column, and typography scales down without clipping.

### Visual tokens

Encode the reference values as CSS custom properties and use them consistently:

- Primary: 500 `#F97316`, 400 `#F9230C`, 300 `#FDBA74`, 200 `#FED7AA`, 100 `#FFF1E5`.
- Neutral: 900 `#0F172A`, 700 `#334155`, 500 `#64748B`, 300 `#CBD5E1`, 200 `#E2E8F0`, 100 `#F1F5F9`, 50 `#FAFAFC`, white `#FFFFFF`.
- Base spacing unit: 4px, with showcase values 4, 8, 12, 16, 24, 32, 40, 48, and 64.
- Radius examples: 4px, 8px, 12px, 16px, 24px, and full/circle.
- Reproduce the small, soft panel borders, warm page background, subtle card shadows, orange focus/active states, green completed state, and pale disabled states visible in the reference.

### Typography and sections

- Load/use an appropriate serif display face for Playfair Display examples and Inter/Geist-compatible sans UI text using the project’s existing font-loading pattern or a safe local fallback. Do not leave the default Create Next App branding.
- Showcase the reference type scale: Display 1 48/56 bold, Display 2 36/44 bold, Heading 1 28/36 semibold, Heading 2 22/30 semibold, Heading 3 18/26 medium, Body Large 16/24, Body 14/20, Small 12/16.
- Include all numbered sections from the image, with the same intent and approximate content density: Colors, Typography, Type Scale, Spacing System, Radius & Shadows, Icons, Buttons, Inputs, Badges/Tags, Status/Indicators, Progress Bar, Cards, Navigation, and Principles.
- Recreate the Vertex mark with CSS/SVG geometry or text-safe inline SVG; do not depend on a missing logo asset.

### Interaction and accessibility

- Buttons, links, select, and text input should be real interactive elements with visible hover, focus-visible, and disabled states matching the specimen.
- The select may be a native `<select>` and the search field may be non-submitting, but they must be keyboard accessible and labeled.
- Decorative icon SVGs should be hidden from assistive technology; meaningful navigation controls need accessible names.
- Use sufficient color contrast for body text and do not communicate state by color alone where a label/icon is present.

## Files expected to change

- `app/page.tsx`: replace starter content with the reusable design-system showcase.
- `app/globals.css`: define page-level tokens, typography helpers, panel/grid styling, responsive rules, and state styles.
- `app/layout.tsx`: update metadata and font setup if needed for the Vertex design system.

Do not modify generated assets, add backend functionality, or create unrelated routes.

## Acceptance criteria

- `/` visually matches the supplied reference in overall composition, section order, colors, typography hierarchy, spacing, borders, controls, cards, and example states.
- All 14 visible reference sections are represented, including the four principles at the bottom.
- The page has no Create Next App copy, logos, dark-mode inversion, or broken image references.
- Desktop layout is dense and aligned like the reference; at phone/tablet widths content remains readable, usable, and free of horizontal overflow except for intentionally scrollable token rows.
- Components are typed, maintainable, and do not rely on arbitrary runtime data or client-side state.
- Focus-visible styles and semantic labels are present for interactive examples.

## Checks

Run from the app root after implementation:

1. `bun run lint`
2. `bun run build`
3. `bun run dev`, open `http://localhost:3000`, and verify the page visually at desktop width and a narrow mobile width.
4. Confirm no horizontal page overflow, no console errors, and keyboard focus is visible on the input, select, links, and buttons.

## Manual test steps

1. Open `/` at approximately 1440px wide and compare the full page against `design/vertex-designsystem.png`.
2. Check each numbered section from 01 through 14 is present and in order.
3. Tab through controls and confirm focus rings are visible; confirm disabled buttons cannot be activated.
4. Resize below 768px and confirm panels stack, card examples remain readable, and the page does not clip or require page-level horizontal scrolling.
