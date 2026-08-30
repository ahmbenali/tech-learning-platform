# Seed Sanity Content from the Provided Files

## Goal

Load the existing `studio/scripts/seed/seed.ndjson` into the Sanity `production` dataset using the Sanity CLI import, without generating any new content and without modifying either provided file, then verify the imported document counts match the source file.

## Skills and guidance read

- Repository `AGENTS.md`: data access and content live in Sanity; any content loading is an operational/config step, not application code. Section 9 describes video documents (id, url, chapters, chunks) as built by a separate offline ingestion pipeline that ingests transcripts — that pipeline does not exist in this repo yet.
- No specialized skill applies directly. `sanity-migration` was considered and not used: that skill is for transforming content from another CMS into Sanity's shape. `seed.ndjson` is already valid Sanity NDJSON (correct `_type`/`_id`/`_key`/reference/`_sanityAsset` shapes), so the plain CLI import path is the correct tool, not a migration/transform pipeline.

## Existing code and data inspected

- `studio/schemaTypes/`: only `category`, `course`, `instructor`, `lesson`, and `module` are defined. There is no `video` document type yet.
- `studio/schemaTypes/course.ts` and `module.ts`: `module` and `learningOutcome` are `type: 'object'` (embedded inside `course`), not documents. `lesson.ts` has its own required `videoUrl` (type `url`) field directly on the lesson document — lessons do not reference a separate video document.
- `studio/scripts/seed/seed.ndjson`: 141 lines (one JSON document per line). Counting top-level `_type` values: 6 `category`, 10 `course`, 5 `instructor`, 120 `lesson` (6+10+5+120 = 141, matches line count exactly). `module` (40), `learningOutcome` (40), `resource` (122), `slug` (141), `image`/`_sanityAsset` (135), `block`/`span` (730 each), and `reference` (140) all appear only nested inside those 141 top-level documents.
- Every lesson's `videoUrl` is already a complete `https://www.youtube.com/watch?v=<id>` URL, and the ids match the ids in `videos.json` for the corresponding lesson slug (e.g. `nextjs-app-router-in-depth-file-system-routing` → `9602Yzvd7ik` in both files).
- `studio/scripts/seed/videos.json`: a single JSON object keyed by lesson slug, holding YouTube `id`, `title`, `channel`, `duration`, and a search `query` per entry. It has no `_id`/`_type` fields, is not NDJSON, and there is no schema type it could import into. It reads as source/reference material for a future transcript-and-chapter ingestion pipeline (AGENTS.md §9), which isn't built yet.
- The 135 image fields use the Sanity import tool's external-asset shorthand, `"_sanityAsset": "image@<url>"` (e.g. `image@https://i.ytimg.com/vi/9602Yzvd7ik/hqdefault.jpg` for lesson thumbnails, `image@https://picsum.photos/seed/.../1600/900` for course covers, `image@https://randomuser.me/api/portraits/...` for instructor photos). The importer fetches each URL and uploads it as a real Sanity asset during import. Verified all three hosts respond (200/302) from this environment.
- `studio/.env`: `SANITY_STUDIO_PROJECT_ID=c9x1v2xi`, `SANITY_STUDIO_DATASET=production`.
- `npx sanity dataset list` (from `studio/`): CLI is already authenticated; `production` is the only dataset.
- Baseline query against `production` before import: `count(*)` = 12, all with `_id` under `_.groups.*` (Sanity's own system access-control documents). Explicit per-type counts confirm 0 existing `category`/`course`/`instructor`/`lesson` documents — a clean baseline, no collisions expected.
- `npx sanity dataset import --help` (from `studio/`): confirms `-d/--dataset`, `--replace` (replace docs with same id), `--missing` (skip docs that already exist), and `--allow-failing-assets` (skip assets that can't be fetched instead of aborting the whole import).

## Decisions and assumptions

1. Import only `seed.ndjson`. `videos.json` is not imported: there is no `video` schema/document type to receive it, it isn't NDJSON, and `seed.ndjson` lessons already carry complete, correct `videoUrl` values derived from the same ids. Per the instruction to not modify the files, it is left in place, untouched and unused, as reference material for whenever the video ingestion pipeline (AGENTS.md §9) gets built.
2. Target dataset is `production` (the only dataset configured/available).
3. Because the baseline has zero existing content documents, run a plain import first (no `--replace`/`--missing` needed). If the import is ever re-run after a partial success, `--replace` is the safe, idempotent option since all `_id`s in the file are deterministic slugs (e.g. `category.web-development`).
4. Do not deploy the Studio application or touch schema as part of this task — AGENTS.md notes Studio deploy is only a prerequisite for the Context MCP to serve the dataset for search, which is unrelated to loading content now.

## Files expected to change

- None in the repository. This is a data-loading operation against the remote `production` Sanity dataset. `studio/scripts/seed/seed.ndjson` and `studio/scripts/seed/videos.json` are read-only inputs and must be byte-for-byte unchanged before and after (verified via checksum, see Checks).

## Requirements

1. Run the import from the `studio/` workspace so the project's own Sanity CLI auth/config applies.
2. Use `npx sanity dataset import scripts/seed/seed.ndjson -d production` (relative path, since the command runs from `studio/`).
3. Do not edit, reformat, or touch `seed.ndjson` or `videos.json` in any way.
4. After import, verify per-type document counts in the dataset equal the source file's counts: `category`=6, `course`=10, `instructor`=5, `lesson`=120.

## Security considerations

- This writes to the shared `production` Sanity dataset (it's the only dataset that exists) — not a disposable/staging dataset. Flagging this explicitly since a bad import isn't trivially undone from the CLI alone (though Sanity retains document history, so individual documents can be reverted).
- No tokens are printed or newly introduced; the operation relies on the CLI's existing authenticated session.
- Asset ingestion fetches from three public, non-sensitive third-party hosts (YouTube thumbnail CDN, picsum.photos, randomuser.me) over HTTPS — no credentials involved, nothing sensitive in the payloads.

## Acceptance criteria

- `sanity dataset import` exits 0.
- GROQ count query confirms exactly 6 `category`, 10 `course`, 5 `instructor`, 120 `lesson` documents in `production`.
- Total non-system document count in the dataset increases by exactly 141.
- Checksums of `seed.ndjson` and `videos.json` are identical before and after the operation.
- A spot-checked course resolves its `instructor` and `category` references and its `coverImage` has a real uploaded asset (not a dangling `_sanityAsset` shorthand). A spot-checked lesson has a working `videoUrl` and an uploaded `thumbnail` asset.

## Checks to run

Run all commands from `studio/`:

1. Checksum both seed files before importing: `md5sum scripts/seed/seed.ndjson scripts/seed/videos.json`.
2. Import: `npx sanity dataset import scripts/seed/seed.ndjson -d production`.
3. Re-run the same checksum command and confirm identical output to step 1.
4. Verify per-type counts:
   `npx sanity documents query "{\"category\": count(*[_type==\"category\"]), \"course\": count(*[_type==\"course\"]), \"instructor\": count(*[_type==\"instructor\"]), \"lesson\": count(*[_type==\"lesson\"])}"`
   Expect `{"category":6,"course":10,"instructor":5,"lesson":120}`.
5. Verify total non-system document count grew by 141:
   `npx sanity documents query "count(*[!(_id in path(\"_.**\"))])"`
   Expect `141` (baseline was 0 non-system content documents before import).
6. Spot-check one course and one lesson resolve references and assets:
   `npx sanity documents query "*[_type==\"course\"][0]{title, \"instructor\": instructor->name, \"category\": category->title, coverImage{asset->{url}}}"`
   `npx sanity documents query "*[_type==\"lesson\"][0]{title, videoUrl, thumbnail{asset->{url}}}"`
   Expect real names/titles (not null) and real `asset.url` values (not missing).

## Manual test steps

1. From `studio/`, run `npx sanity dev` (or `bun run dev`) and log in.
2. Open the Content tool and confirm 6 Categories, 10 Courses, 5 Instructors, and 120 Lessons are listed.
3. Open one course, confirm its cover image renders, its instructor/category resolve, and its modules list the expected lessons in order.
4. Open one lesson, confirm its thumbnail renders and its notes (Portable Text) display formatted content, not raw JSON.
5. Confirm `studio/scripts/seed/seed.ndjson` and `studio/scripts/seed/videos.json` are unchanged in `git status` (still untracked/unmodified, no diffs).
