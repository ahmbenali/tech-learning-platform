# Implement Vertex Lesson Page

## Goal
Build `/lessons/[slug]` to match `design/vertex-lesson.png` exactly, fully wired to seeded Sanity content. The page shows a two-column layout (sidebar + main), a YouTube iframe video player, tabbed content (Course Content / Notes), and prev/next lesson navigation.

---

## Design analysis (`design/vertex-lesson.png`)

### Page structure
- Full-width `SiteHeader` at top (no changes to header)
- Below header: two-column grid — `~280px` fixed sidebar + `flex-1` main
- Bottom sticky bar inside the main column

### Left sidebar
- **Course badge**: dark (`#070a0d`) `~48×48px` square with first letter of course title in white serif, 20px. Course title text next to it.
- **Module label**: `"Module {n} of {total}"` in muted `#6a7383`, `13px`, below course badge
- **Divider**: `1px solid #eee5e0` right border between sidebar and main
- **Lesson list** (all lessons in the current module, scrollable):
  - Each row: `32px` circle (empty for uncompleted, filled orange for active) + lesson number `"{moduleIndex}.{lessonIndex}"` (muted) + lesson title (truncated)
  - Active lesson: `background: rgba(249,35,12,0.06)`, ink text, left-side `3px orange` accent strip
  - Sidebar itself is sticky (`top: 72px`) with `height: calc(100vh - 72px); overflow-y: auto`

### Main content
- **Breadcrumb** (top-left of main, below header): `All Courses > {course title} > {module title} > {lesson title}`. Muted gray links, ink for current. Bookmark icon button on the far right of this row.
- **Video** (below breadcrumb): `aspect-ratio: 16/9`, `background: #000`, `border-radius: 12px`. YouTube iframe embed (`youtube-nocookie.com`). Reads `?start` search param from URL for seek-to-time.
- **Tabs** (below video): `"Course Content"` | `"Notes"`. Active tab has `2px solid var(--orange-strong)` bottom border, ink text. Inactive is muted. Client-side toggle, no navigation.
- **Course Content tab**:
  - `"Overview"` heading (`h2`, 20px, 600)
  - Description paragraph (lesson `notes` first block plain-text excerpt, ~2 sentences. If notes is Portable Text, extract the first paragraph's text.)
  - **"In this lesson you will"** heading + unordered list of `keyPoints` (each with a small check icon)
  - **Pro Tip box** (only if `proTip` is set): warm background `#fff8f5`, `4px left border var(--orange)`, `border-radius: 10px`, `padding: 18px 22px`. "Pro Tip" label in orange + text below.
  - **Resources** section (only if `resources.length > 0`): `"Resources"` heading + horizontal-wrapping grid of resource cards. Each card: icon (map type → Icon name: `article→file`, `code→code`, `download→bookmark`, `link→arrow`), title `(15px 500)`, description `(13px muted)`, `"Open resource →"` link in orange.
- **Notes tab**: renders `lesson.notes` as Portable Text via `<PortableText>` from `next-sanity` with basic component overrides (h2→`<h2>`, h3→`<h3>`, normal→`<p>`, links open in new tab).

### Bottom navigation bar
Sticky inside the main column (`position: sticky; bottom: 0`), full width of main, `background: rgba(255,255,255,0.96); backdrop-filter: blur(8px); border-top: 1px solid #ebdfd9`:
- Left: `"← Previous Lesson"` ghost button (`color: var(--ink)`, no background) with the previous lesson's title below it in `12px muted`. Hidden if no previous lesson.
- Right: `"Continue →"` using `.primary-action` style, links to next lesson slug. If no next lesson, links back to the course page.

---

## Code inspected

- **`sanity/lib/queries.ts`**: `LESSON_BY_SLUG_QUERY` fetches `course.modules[].lessonIds` (IDs only, not lesson details). I need a new query that also fetches `title`, `slug`, `durationSeconds` for each sibling lesson.
- **`sanity/lib/data.ts`**: `getLessonBySlug` / `LessonDetail` (no sidebar data). `getLessonSlugs` exists for `generateStaticParams`.
- **`app/globals.css`**: `.home-page` has `overflow: hidden` (breaks sticky sidebar). `.lesson-row`, `.lesson-list`, `.lesson-index`, `.lesson-title`, `.lesson-duration`, `.course-crumbs`, `.course-sticky-bar`, `.primary-action`, `.resource-card` already exist.
- **`app/components/Icon.tsx`**: icons: `check`, `play`, `arrow`, `file`, `code`, `bookmark`, `clock`, `star`.
- **`app/components/SiteHeader.tsx`**: `"use client"`, uses `usePathname()`. Courses link is active for `/courses/*`.
- **`app/courses/[slug]/page.tsx`**: pattern for server component page + client interactions split.

---

## Decisions

1. **New query** `LESSON_PAGE_QUERY`: extends course projection to include `"lessons": lessons[]->{_id, title, "slug": slug.current, "durationSeconds": coalesce(durationSeconds, duration)}` per module, plus `"moduleCount": count(modules)`. Does NOT change the existing query.

2. **New data function** `getLessonPage(slug)` returning `LessonPageData`:
   ```ts
   type ModuleSiblingLesson = { _id: string; title: string; slug: string; durationSeconds: number }
   type LessonPageData = {
     lesson: Omit<LessonDetail, 'course' | 'module'> // all lesson fields
     courseId: string
     courseTitle: string
     courseSlug: string
     moduleIndex: number       // 1-based
     totalModules: number
     moduleTitle: string
     lessonIndexInModule: number  // 1-based (position in this module)
     moduleLessons: ModuleSiblingLesson[]
     prevLesson: ModuleSiblingLesson | null
     nextLesson: ModuleSiblingLesson | null
   }
   ```

3. **Page layout**: Use a new `.lesson-page-root` class (NOT `.home-page`) that has the same border-inline + background but `overflow: visible` so the sticky sidebar works. The `SiteHeader` is inside it.

4. **Video player**: Server-rendered `<iframe>` using YouTube nocookie embed (`https://www.youtube-nocookie.com/embed/{id}?rel=0&modestbranding=1`). Add `&start={n}` when `searchParams.start` is a valid positive integer. Extract video ID with `/[?&]v=([^&]+)/`.

5. **Tabs**: `LessonTabs` client component receives: `notes` (Portable Text array), `keyPoints` (string[]), `proTip` (string | undefined), `resources` (resource array). Renders both tab panels in DOM, toggles visibility with CSS (`display: none` / `display: block`).

6. **Sidebar course badge**: `{courseTitle[0].toUpperCase()}` inside a dark `48×48px` rounded square, no external image needed.

7. **Completed lessons**: No progress data yet — show all lessons as uncompleted. Reserve `.lesson-sidebar-row--active` class for the current lesson.

8. **Breadcrumb "COURSE N" label**: Omit the number; the design label is decorative. Breadcrumb path is `All Courses > {courseTitle} > {moduleTitle} > {lessonTitle}`.

9. **Portable Text notes overview**: Rather than extracting plain text server-side, the Course Content tab shows `keyPoints` as the "in this lesson" list. The first prose paragraph is shown as the "Overview" paragraph by rendering just the first block of the notes array if it's a plain block.

---

## Files to touch

| File | Action |
|------|--------|
| `sanity/lib/queries.ts` | Add `LESSON_PAGE_QUERY` |
| `sanity/lib/data.ts` | Add `ModuleSiblingLesson`, `LessonPageData` types + `getLessonPage` function |
| `app/lessons/[slug]/page.tsx` | **Create** — server component, `generateStaticParams`, `generateMetadata` |
| `app/lessons/[slug]/LessonTabs.tsx` | **Create** — `"use client"`, tab toggle + Portable Text notes |
| `app/globals.css` | Add ~160 lines of lesson page CSS |

---

## Security

- `server-only` import is already on `sanity/lib/data.ts` — no token leaks.
- Use `youtube-nocookie.com` embed domain (privacy-enhanced).
- `<iframe>` gets `allow="autoplay; fullscreen"` and `referrerPolicy="strict-origin-when-cross-origin"`.
- All resource links: `target="_blank" rel="noopener noreferrer"`.
- `searchParams.start` is sanitized: `parseInt(..., 10)` and only appended when `> 0`.

---

## Acceptance criteria

- [ ] `/lessons/nextjs-app-router-in-depth-server-components` renders without 404 or TS error
- [ ] Sidebar lists all lessons in the lesson's parent module; current lesson is visually highlighted
- [ ] Video iframe embeds the correct YouTube video
- [ ] `?start=60` causes the embed to start at 60 seconds
- [ ] "Course Content" and "Notes" tabs toggle without page reload
- [ ] "Previous Lesson" link navigates to the previous lesson in the module
- [ ] "Continue" button navigates to the next lesson (or to the course page if last)
- [ ] `npx tsc --noEmit` passes
- [ ] `npx next lint` passes

---

## Checks to run

```bash
# from /my-app
npx tsc --noEmit
npx next lint
```

---

## Manual test steps

1. Start dev server: `npm run dev` in `/my-app`
2. Open `/courses` → click any course → click any lesson link
3. Confirm redirect lands on `/lessons/{slug}` with the correct lesson title
4. **Sidebar**: verify current lesson is highlighted; other module lessons are listed
5. **Video**: confirm YouTube iframe embeds and the player appears
6. **Seek**: append `?start=30` to the URL → video should begin at 30 seconds
7. **Tabs**: click "Notes" → Portable Text content appears; click "Course Content" → switches back
8. **Pro Tip**: if lesson has a `proTip`, verify the styled box appears
9. **Resources**: verify resource cards render with correct titles and links
10. **Bottom nav**: verify "← Previous Lesson" and "Continue →" links; click both and confirm correct navigation
11. **Mobile** (resize to 375px): sidebar hidden, video full-width, content stacked
