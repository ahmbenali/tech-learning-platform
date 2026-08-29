# Implement Vertex Content Model, Studio, and Server-Side Read Layer

## Goal

Implement the initial Sanity content model and authoring experience for Vertex's core learning content—courses, embedded modules, lessons, instructors, and categories—and add a server-only Next.js read client, typed GROQ queries, and data-access functions for the read-only learning surfaces.

## Skills and guidance read

- `sanity-best-practices`: schema, GROQ, Portable Text, Studio structure, and Next.js integration guidance.
- Project `AGENTS.md`: requires a standalone Studio, private server-side Sanity reads, read-only public content pages, Portable Text for rich content, and module ordering through an embedded course object.
- Installed Next.js 16 documentation: Server Components are the default for data fetching; data access must be server-only, return minimal DTOs, and not let private tokens cross the server/client boundary.

## Existing code inspected

- `studio/` is already a standalone Sanity 5 workspace with Vision and Structure plugins, public Studio environment helpers, and an intentionally empty `schemaTypes/index.ts`.
- `studio/structure.ts` currently shows the generic document lists only.
- The web workspace already has `next-sanity`, `@sanity/image-url`, public Sanity environment helpers in `sanity/env.ts`, a basic client in `sanity/lib/client.ts`, image URL helper, and an unused live-content scaffold.
- The root `.env.example` currently has only public Sanity project/dataset/API-version values. It does not list a server-only read token.
- The home page still has hard-coded course display data; wiring UI pages to this data layer is outside this request.
- The worktree has pre-existing uncommitted Studio scaffolding, prompt files, and homepage work. Preserve all unrelated changes.

## Decisions and assumptions

- The supplied scope is limited to the five requested content types. Video intelligence, agent context, progress, content imports, search, and UI route changes are intentionally deferred.
- `course`, `lesson`, `instructor`, and `category` are documents. `module` is an embedded object in `course.modules`, never a document.
- Courses reference one instructor and one category. Modules keep an ordered array of lesson references. Lessons do not carry a course reference; course membership is derived with reverse-reference GROQ queries.
- Use standard Sanity images with hotspot support for cover, thumbnail/poster, and instructor photo. Store provider video URLs, not video files.
- Use seconds for lesson duration (`durationSeconds`) so later video playback, progress, and timestamped search can share the same unit.
- Use Portable Text for lesson notes with normal text, headings, lists, block quotes, and safe external links. It will be rendered later by the frontend, not as Markdown.
- Add sensible required-field, URL, numeric-range, array-length, and slug validation. Use document and object preview configurations to make Studio content recognizable.
- The Studio desk will expose a deliberate **Learning Content** grouping with Courses, Lessons, Instructors, and Categories. Modules remain editable inline on courses.
- The web client will use the existing public project/dataset/API-version identifiers plus a new server-only `SANITY_API_READ_TOKEN`. It will set `useCdn: false` for private-dataset reads and be marked with `server-only` so a Client Component cannot import it.
- Add a small fetch wrapper with explicit field projections and a 60-second revalidation policy. The data layer returns only page-safe DTOs and uses parameterized query inputs. It will not enable live content or expose a browser token.
- Add query/data functions for course catalog cards, a course by slug (including ordered module lessons), a lesson by slug (including its derived course/module position and instructor), an instructor by slug (including their courses), categories, and slug lists useful for future static params.
- Existing unused `sanity/lib/live.ts` will not be enabled or imported. If needed to keep the server-only boundary correct, it will be removed rather than configured with a token that could later be exposed.
- No Sanity schema or Studio deploy is included: deployment changes external project state and needs configured credentials/explicit release authority. Local Studio build/type-check will validate the implementation.

## Files expected to change

- `studio/schemaTypes/index.ts`: register all schemas.
- `studio/schemaTypes/course.ts`, `module.ts`, `lesson.ts`, `instructor.ts`, and `category.ts`: define the Vertex content model and previews.
- `studio/structure.ts`: provide the focused Learning Content desk structure.
- `studio/package.json` and `studio/bun.lock`: explicitly add the Studio icon package if required by the schema previews.
- `.env.example`: document `SANITY_API_READ_TOKEN` with no value.
- `sanity/lib/client.ts`: make the Sanity client private/server-only and configure its read token safely.
- `sanity/lib/queries.ts`: declare named, parameterized GROQ queries using `defineQuery`.
- `sanity/lib/fetch.ts`: provide the server-only Sanity fetch wrapper.
- `sanity/lib/data.ts`: expose small cacheable DTO-returning data access functions.
- `sanity/lib/live.ts`: remove or adjust only if necessary to prevent it contradicting the private-token model.

## Requirements

1. Register the five requested types and no unrequested app-state, search, video-transcript, or agent configuration types.
2. Model every fixed field from the project requirements:
   - Course: title, slug, summary, cover image, level, price, optional popular flag, student count, learning outcomes (icon/title/description), instructor/category references, and ordered embedded modules.
   - Module: title, summary, and ordered lesson references.
   - Lesson: title, slug, video URL, thumbnail/poster image, duration, free-preview flag, student count, Portable Text notes, key points, optional pro tip, and typed resources (type/title/description/URL).
   - Instructor: name, slug, photo, expertise, and bio.
   - Category: title, slug, and description.
3. Use `defineType`, `defineField`, and `defineArrayMember` throughout; do not store layout-driven course/module/lesson numbers.
4. Use a separate Studio workspace only. Do not add a Next.js `/studio` route.
5. Put all web read-client, query, fetch, and data-layer modules behind `server-only`; callers must not need or receive the read token.
6. Parameterize GROQ slug values and project only fields required by the DTO. Expand related data deliberately and derive lesson/course membership with reverse references where needed.
7. Keep all values serializable and public-safe for future Server Component callers. Do not alter the hard-coded homepage or add UI routes.
8. Keep `.env.example` as the canonical variable list without credentials; only `NEXT_PUBLIC_*` values may be browser-visible.

## Security considerations

- `SANITY_API_READ_TOKEN` is server-only, never prefixed with `NEXT_PUBLIC_`, never returned from helpers, and never written to tracked environment files.
- The private Sanity dataset is queried only through the server-only client/fetch/data modules.
- GROQ dynamic values use query parameters, not string interpolation.
- Queries use narrow projections, avoiding accidental transfer of drafts, tokens, or unnecessary authoring metadata to future client components.
- Resource and video URLs are validated as HTTPS URLs where supported by the required providers; no external fetches, write clients, or browser-side content mutations are introduced.

## Acceptance criteria

- The Studio starts with Courses, Lessons, Instructors, and Categories organized under Learning Content, and a course author can create inline modules that reference existing lessons in order.
- All requested model fields are authorable, validated, and have useful previews.
- The web data layer has server-only functions for catalog, course, lesson, instructor, category, and slug retrieval with explicit GROQ projections.
- Lesson lookup derives its course/module context from course modules rather than storing a parent reference on the lesson.
- No secret token appears in browser-accessible code or any committed environment file.
- Existing standalone Studio scaffolding, web auth, homepage, and other uncommitted changes remain intact except for direct integration files listed above.

## Checks to run

1. `bun run lint` from the repository root.
2. `bunx tsc --noEmit` from the repository root.
3. `bun --cwd studio run typecheck`.
4. `bun --cwd studio run build` when local Studio public environment values are configured; otherwise report the exact configuration failure without substituting values.
5. `bun run build` from the repository root because server modules/configuration change.
6. `git diff --check` for the files changed by this work.

## Manual test steps

1. Add the public Studio project/dataset values to `studio/.env` and the public web values plus `SANITY_API_READ_TOKEN` to the web `.env.local`; do not commit either file.
2. Run `bun --cwd studio run dev` and open `http://localhost:3333`.
3. Create an instructor and category, then create lessons with notes, key points, and resources.
4. Create a course, select its instructor and category, add one or more modules, and order lesson references within them.
5. Confirm the Courses, Lessons, Instructors, and Categories lists and document previews are clear in Studio.
6. Run the listed checks, then use a future Server Component or temporary server-only test to call each data function and verify no token is sent to the browser.
