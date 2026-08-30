# Implement Vertex course page

## Goal

Build the course detail route `/courses/[slug]` as shown in `design/vertex-course.png`, wired to the live Sanity content via the existing `getCourseBySlug` helper. Reproduce the desktop layout exactly and make it responsive down to mobile.

## Skills consulted

- `AGENTS.md` §3 (UI work — reproduce the design exactly, no restyling), §5 (server/client boundaries, private token stays on server), §6 (tech stack), §7 (progress is per-learner state — presentational stub is fine here), §13 (checks to run).
- `sanity-best-practices` — using existing `sanityFetch` + `defineQuery` patterns; no new schema or query work is needed for this page.
- Next.js 16 docs read from `node_modules/next/dist/docs/`:
  - `01-app/03-api-reference/03-file-conventions/page.md` — `params` is `Promise<{ slug: string }>` in Next 16; `PageProps<'/courses/[slug]'>` is a global helper.
  - `01-app/03-api-reference/03-file-conventions/dynamic-routes.md` — same, plus `generateStaticParams`.
  - `01-app/03-api-reference/02-components/image.md` — `remotePatterns` is required for external hosts; `priority` is deprecated in Next 16 (use `preload` for the LCP hero image); `qualities` defaults to `[75]`.

## Code inspected

- `app/page.tsx` — home page inlines a `VertexMark`, an `Icon` SVG component, and the site header (brand + nav + Clerk buttons). Uses vanilla CSS classes from `globals.css`.
- `app/layout.tsx` — wraps children in `<ClerkProvider>`; uses `LayoutProps<'/'>`.
- `app/globals.css` — Tailwind v4 base plus a large block of hand-written CSS. Design tokens live at `:root` (`--orange`, `--orange-strong`, `--orange-soft`, `--ink`, `--muted`, `--line`, `--canvas`). The home page already establishes `.home-page`, `.home-header`, `.home-brand`, `.home-nav`, `.home-actions`, `.icon-button`, `.auth-*` styles — these can be reused unchanged for the course page's header row.
- `studio/schemaTypes/course.ts`, `module.ts`, `lesson.ts`, `instructor.ts`, `category.ts` — content model matches what the design needs (title, summary, coverImage, level, price, popular, studentCount, learningOutcomes[{icon,title,description}], instructor→, category→, modules[{title,summary,lessons[→lesson]}]).
- `sanity/lib/queries.ts` — `COURSE_BY_SLUG_QUERY` already returns everything the page needs, including `learningOutcomes`, and nested `modules[].lessons[]->{...lessonCardFields}` with `durationSeconds`, `keyPoints`, `freePreview`.
- `sanity/lib/data.ts` — `getCourseBySlug(slug)` returns a `CourseDetail` with modules and lessons already numbered (`index: 1..N`). No additional data plumbing needed.
- `sanity/lib/client.ts` / `fetch.ts` — server-only client with `SANITY_API_READ_TOKEN`, 60-second `revalidate` default. Fine as-is.
- `next.config.ts` — empty. Needs `images.remotePatterns` before `<Image>` can render Sanity-hosted covers.
- `studio/scripts/seed/seed.ndjson` — contains 6 categories + several instructors, courses, and lessons. Courses have 4 modules and lessons per course. **Field-name mismatch found:** seeded lessons use `"duration": 350`, but the schema and query use `durationSeconds`. See "Assumptions & open issues" below.

## Decisions & assumptions

- **Route path**: `app/courses/[slug]/page.tsx` (App Router server component, async). Uses `PageProps<'/courses/[slug]'>` and `getCourseBySlug(slug)`. Calls `notFound()` when no course matches.
- **Extract shared header** into `app/components/SiteHeader.tsx` and shared icons into `app/components/Icon.tsx`, then update `app/page.tsx` to import them. Rationale: the design shows the exact same top nav on both pages; keeping it in one place avoids drift, matches the intent behind the pre-existing `app/components/` folder, and stays a small refactor. Icon library is extended with the new icons needed for the course page (`chart`, `clock`, `file`, `bookmark`, `chevron-down`, `sparkles`, `layers`, `rocket`, `target`, `gauge`, `code`, `workflow`, `puzzle`, `shield`, `check`).
- **Section-by-section from the design**:
  1. **Breadcrumb**: "All Courses / {course title}". "All Courses" links to `/#courses` (the home page's courses section — there's no `/courses` catalog page yet).
  2. **Hero (2-col on desktop)**: left column is the cover image rendered by `next/image` (`fill` + `sizes` + `preload` since it is the LCP element); right column shows a `POPULAR` pill (only if `course.popular`), the title (serif, matching home page typography), summary, a meta row (level · total duration · lesson count · student count), and two buttons: **Continue Learning** (orange primary, links to first lesson slug) and **Bookmark** (secondary ghost, non-functional visual only, per AGENTS.md §7 — bookmark isn't a scoped backend).
  3. **What you'll learn**: 2×2 grid of `learningOutcomes` cards, each with the mapped icon + title + description.
  4. **Course Content**: header row with total lesson count and total duration, then a list of modules. Each module is a native `<details>` element (accordion) — no `"use client"` needed, keyboard-accessible out of the box. First module is `open` by default, matching the design. Each row shows the module index badge, title, summary, and total duration on the right, plus a chevron. Expanded state reveals the lesson list underneath (lesson index `X.Y`, title, duration, and free-preview badge if applicable). Each lesson is a link to `/lessons/{slug}` (route doesn't exist yet — that's fine, the lesson page is a future task).
  5. **"Show all X modules" toggle**: only rendered if `modules.length > 6`. In the current seed, courses have 4 modules, so it will be hidden. This keeps scope tight and honors the design when data grows.
  6. **Sticky bottom bar**: shows a static `40% complete` progress bar + "Continue Learning" button. Per AGENTS.md §7, progress persistence is a separate task; this is a presentational stub matching the design exactly.
- **Formatters** in a new `sanity/lib/format.ts` (server-safe, no React):
  - `formatDuration(seconds, style?: 'long' | 'short')` → `"18m"`, `"1h 24m"`, `"8h 24m"`.
  - `formatLevel(value)` → `"Beginner" | "Intermediate" | "Advanced"`.
  - `formatStudentCount(count)` → `"2,847 students"` (thousands separator via `Intl.NumberFormat`).
- **Images**: Sanity cover images resolve through `cdn.sanity.io`. `next.config.ts` gets `images.remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }]`. Use `urlFor(image).width(1200).height(800).url()` for the hero cover to feed a sized URL to `next/image`.
- **Static generation**: add `generateStaticParams` that returns all course slugs via `getCourseSlugs`. Prerender all courses at build.
- **Metadata**: `generateMetadata({ params })` returns `title` and `description` from the course, so social sharing and browser tabs look right.
- **404**: unknown slugs call `notFound()` (Next-recommended). Optional: a minimal `not-found.tsx` under the route would be nice but is out of scope.

## Assumptions & open issues

- **Duration field mismatch (must decide)**: the seed writes `"duration": 350` on lesson documents, but the schema and GROQ query expect `durationSeconds`. So `lesson.durationSeconds` will be `null` for every currently-seeded lesson and the meta strip will show `"— min"`. Two paths:
  1. **Recommended, minimal**: patch `COURSE_BY_SLUG_QUERY` (and `LESSON_BY_SLUG_QUERY`) to project `"durationSeconds": coalesce(durationSeconds, duration)`. Non-destructive, one-line change per query, works for both old and new data. The proper long-term fix (rename `duration` → `durationSeconds` in the dataset) is a separate migration task.
  2. Regenerate `seed.ndjson` with the correct field name and re-import. Out of scope for a UI task.
- The **My Learning** link in the top nav points at the home page's `#learning` anchor (matches current home behavior). No `/my-learning` route yet.
- The **Bookmark** button and the **40% progress** bar in the sticky bar are visual only (no backend). Flagged in the "Needs your attention" report.

## Files to touch

- **New**: `app/courses/[slug]/page.tsx` — server component; the course page.
- **New**: `app/components/SiteHeader.tsx` — shared header (brand, nav, notification bell, Clerk sign-in/sign-up/user-button). Accepts an `activeNav?: 'courses' | 'learning'` prop so the correct link shows the orange active state.
- **New**: `app/components/Icon.tsx` — shared SVG icon library, extending the current home-page icon set.
- **New**: `sanity/lib/format.ts` — duration / level / student-count formatters.
- **Edit**: `app/page.tsx` — swap the inlined `VertexMark`, `Icon`, and header markup for `<SiteHeader activeNav="courses" />` and the shared `Icon`. No visual change.
- **Edit**: `app/globals.css` — append course-page styles (`.course-page`, `.course-crumbs`, `.course-hero`, `.course-cover`, `.course-hero-body`, `.popular-pill`, `.course-meta-row`, `.course-actions`, `.primary-action`, `.secondary-action`, `.learn-section`, `.learn-grid`, `.learn-card`, `.content-section`, `.module-item`, `.module-summary`, `.lesson-row`, `.free-badge`, `.course-sticky-bar`, `.progress-track-lg`), plus responsive breakpoints (hero collapses to single column below 900px, sticky bar stacks below 600px). No changes to existing home styles.
- **Edit**: `next.config.ts` — add `images.remotePatterns` for `cdn.sanity.io`.
- **Edit**: `sanity/lib/queries.ts` — one-line coalesce fix on the lesson-card duration projection so the page renders real durations against the current seed (see "Assumptions").

## Requirements

- Server component; no client boundary unless required. The accordion uses native `<details>` — no JS.
- Uses `getCourseBySlug` and `getCourseSlugs` from `sanity/lib/data.ts`. No direct client access.
- Renders every visible piece of the design at desktop widths (≥1200px), reproducing spacing, typography (serif for titles), the orange primary CTA style, and the meta row order shown in the reference.
- Responsive: hero collapses to a single column below 900px; module summaries wrap; sticky bottom bar stacks below 600px; nothing overflows or breaks below 375px.
- Metadata (`title`, `description`) is set per course.
- All course slugs from Sanity are prerendered via `generateStaticParams`.

## Security

- All Sanity access goes through the existing server-only client (`sanity/lib/client.ts`). No token reaches the browser.
- Clerk usage stays consistent with the home page (`<SignInButton>`, `<SignUpButton>`, `<UserButton>` inside `<Show>`); the publishable key stays public, secret key stays server-side (unchanged).
- No new environment variables. No client-side writes.
- `next/image` `remotePatterns` restricted to `cdn.sanity.io/images/**` — matches Sanity's asset CDN path only, not the whole host.
- All external links from resources (once we render them on the lesson page — future task) will use `rel="noreferrer noopener"`; not applicable on this page.

## Acceptance criteria

- `/courses/nextjs-app-router-in-depth` (and every other seeded course slug) returns 200, prerendered.
- Hero shows cover image, POPULAR pill only when `course.popular` is true, title, summary, meta (level · total duration · lesson count · student count with thousands separator), Continue Learning + Bookmark buttons.
- "Continue Learning" (both hero and sticky bar) links to `/lessons/{first-lesson-slug}` where the first lesson is `modules[0].lessons[0]`.
- "What you'll learn" grid renders one card per learningOutcome, using the icon mapping.
- Course Content lists every module in order; each module shows its index, title, summary, total duration, and lesson count. The first module is expanded; the rest are collapsed. Expanding a module reveals its lessons with `X.Y` labels, per-lesson duration, and a `Free preview` badge on lessons where `freePreview === true`.
- Unknown slug → 404 via `notFound()`.
- No hydration warnings, no console errors in dev.
- Home page (`/`) still renders identically after the SiteHeader/Icon extraction.

## Checks to run (from `my-app`)

- `bun run lint` — must pass with no new warnings.
- `bunx tsc --noEmit` — must pass.
- `bun run build` — must succeed (routes and next.config change → build required per AGENTS.md §13).
- `bun run dev` — visit `/`, `/courses/nextjs-app-router-in-depth`, `/courses/typescript-for-application-developers`, `/courses/does-not-exist`.

## Manual test steps

1. `bun run dev`, open `http://localhost:3000/` — home page renders unchanged (SiteHeader swap did not visually drift).
2. Navigate to `/courses/nextjs-app-router-in-depth`.
3. Confirm the top nav matches the home nav (Vertex mark, Courses, My Learning, bell, Clerk buttons/avatar).
4. Confirm the breadcrumb reads `All Courses / Next.js App Router in Depth`.
5. Confirm hero: cover image on the left; POPULAR pill on the right (this course has `popular: true`), title in serif, summary, meta row (`Intermediate · <duration> · 12 lessons · 18,240 students`), Continue Learning (orange) + Bookmark (ghost).
6. Click Continue Learning — URL becomes `/lessons/nextjs-app-router-in-depth-file-system-routing` (404 page from Next is expected, since the lesson route isn't built yet).
7. What you'll learn: 4 cards in a 2×2 grid, each with the icon rendered.
8. Course Content: first module is expanded showing 3 lessons with `1.1`, `1.2`, `1.3`; other modules are collapsed. Click to expand module 2 — lessons appear.
9. Scroll to bottom — sticky bar shows `40% complete` with a progress bar and Continue Learning button.
10. Visit `/courses/typescript-for-application-developers` and confirm the same layout renders with different content.
11. Visit `/courses/does-not-exist` — Next.js default 404 page.
12. Resize to ~375px — hero stacks (image on top, body below), meta row wraps, sticky bar layout stays usable, nothing overflows horizontally.
13. Open DevTools console — no warnings or errors, no hydration mismatch.
