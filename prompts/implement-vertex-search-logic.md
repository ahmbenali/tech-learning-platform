# Implement Vertex Intelligent Search Logic

## Goal

Build the server-side search API that powers Vertex's intelligent lesson and video search. Scope is search logic only — no results UI. This covers:

1. A `video` Sanity schema type (needed for chapters + transcript chunks, even before ingestion runs)
2. New packages: `ai`, `@ai-sdk/openai`, `@ai-sdk/mcp`, `zod`
3. Shared Zod schemas for `SearchResponse` (`lib/search-types.ts`)
4. A cached `initialContext` loader (`lib/search-context.ts`)
5. The search API route (`app/api/search/route.ts`)
6. Updated `.env.example` with new required vars

The results page UI (rendering `VideoResult` and `LessonResult` cards) is a separate task.

---

## Skills read

- `create-agent-with-sanity-context` — MCP connection pattern, initial-context caching, tool exclusion, env vars
- `nextjs-agent.md` reference — `createMCPClient`, `streamText` with tools, tool exclusion pattern

---

## Code inspected

- **`package.json`** — no `ai`, `@ai-sdk/*`, or `zod` yet. Package manager is `bun@1.2.22`.
- **`sanity/lib/client.ts`** — server-only Sanity client using `SANITY_API_READ_TOKEN`. Re-use this token for the MCP (it is a viewer read token, which is all the MCP needs).
- **`sanity/env.ts`** — exports `projectId`, `dataset`, `apiVersion`.
- **`studio/schemaTypes/index.ts`** — exports `[course, courseModule, lesson, instructor, category]`. No `video` type yet.
- **`app/lessons/[slug]/page.tsx`** — already reads `?start` search param and appends it to the YouTube embed URL as `&start=`. Video result links just need `/lessons/{slug}?start={seconds}`.
- **`sanity/lib/queries.ts`** — existing GROQ patterns use `pt::text()` is not yet used but Portable Text notes field exists on lesson.
- **`.env.example`** — has `SANITY_API_READ_TOKEN` but not `SANITY_CONTEXT_MCP_URL` or `OPENAI_API_KEY`.

---

## Decisions and assumptions

### 1. OpenAI, not Anthropic

AGENTS.md section 6 specifies "the Vercel AI SDK with the OpenAI provider." Use `@ai-sdk/openai` with `gpt-4o` as the model. Add `OPENAI_API_KEY` to env.

### 2. `generateText` + inline JSON schema

`generateObject` does not support multi-step tool calls in the AI SDK. Instead:
- Use `generateText` with MCP tools and `maxSteps: 10`
- System prompt instructs the LLM to output only valid JSON matching `SearchResponseSchema`
- Parse the final `text` output and validate with Zod

This keeps the route simple and avoids a two-stage call.

### 3. Single MCP token

The existing `SANITY_API_READ_TOKEN` (viewer role) is sufficient for the MCP. No new Sanity token needed.

### 4. MCP URL without a slug (initially)

The Sanity Context document (`sanity.agentContext`) does not exist yet. Use the base URL without a slug:
```
SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v2026-03-03/context/mcp/{projectId}/{dataset}
```
The Context document (with `groqFilter` scoped to content types only) is a follow-up task for the `dial-your-context` skill.

### 5. Module-level `initialContext` cache

Cache the schema context at the module level (a plain `let` variable). It re-fetches on server restart — no stale cache risk, no external cache needed.

### 6. Video schema type — hidden from Studio UI

Add `video` as a Sanity document type with fields matching AGENTS.md section 8:
- `id`: `string` — unique key derived from the video URL (no special chars)
- `url`: `string` — the original video URL
- `chapters`: array of `{ startSeconds: number, label: string }`
- `chunks`: array of `{ startSeconds: number, text: string }`

Set `hidden: true` in `defineType` so it does not appear in the Studio nav. The ingestion pipeline writes to this type; the search API reads from it.

### 7. Both search paths run in parallel

The LLM is instructed to run two `groq_query` tool calls (lesson search and video chapter search) and merge results before producing the final JSON. This avoids sequential round-trips.

### 8. Critical GROQ rules in the system prompt

Per AGENTS.md section 12, the inline system prompt is more reliable than the Context document alone. Put all critical rules in the inline prompt. The Context document (future) adds domain-specific delta only.

### 9. Wildcard + OR text matching

The system prompt explicitly forbids matching whole phrases. All keyword matches use `*token*` wildcard and OR logic. `pt::text(notes)` is used for Portable Text fields.

---

## Files to touch

| Action | File |
|--------|------|
| Create | `lib/search-types.ts` — Zod schemas for `VideoResult`, `LessonResult`, `SearchResponse` |
| Create | `lib/search-context.ts` — cached `getInitialContext()` and `getMcpClient()` |
| Create | `app/api/search/route.ts` — POST handler |
| Create | `studio/schemaTypes/video.ts` — `video` document schema |
| Modify | `studio/schemaTypes/index.ts` — add `video` to the schema array |
| Modify | `.env.example` — add `SANITY_CONTEXT_MCP_URL`, `OPENAI_API_KEY` |

---

## Requirements

### `lib/search-types.ts`

```typescript
import { z } from 'zod'

export const VideoResultSchema = z.object({
  type: z.literal('video'),
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  courseTitle: z.string(),
  courseIcon: z.string().describe('First uppercase letter of the course title'),
  moduleLessonLabel: z.string().describe('e.g. "Lesson 3.2 in State Management"'),
  thumbnailUrl: z.string().nullable(),
  description: z.string().max(200),
  matchedSecond: z.number().int().min(0),
})

export const LessonResultSchema = z.object({
  type: z.literal('lesson'),
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  courseTitle: z.string(),
  courseIcon: z.string(),
  moduleLessonLabel: z.string(),
  keyPoints: z.array(z.string()).max(4),
  description: z.string().max(200),
})

export const SearchResultSchema = z.discriminatedUnion('type', [
  VideoResultSchema,
  LessonResultSchema,
])

export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  totalCount: z.number().int().min(0),
  courseCount: z.number().int().min(0),
  query: z.string(),
})

export type VideoResult = z.infer<typeof VideoResultSchema>
export type LessonResult = z.infer<typeof LessonResultSchema>
export type SearchResult = z.infer<typeof SearchResultSchema>
export type SearchResponse = z.infer<typeof SearchResponseSchema>
```

### `lib/search-context.ts`

```typescript
import 'server-only'

// Module-level cache — cleared on server restart only
let cachedContext: string | null = null

export async function getInitialContext(): Promise<string> {
  if (cachedContext) return cachedContext
  const url = buildContextUrl('/initial-context')
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` },
  })
  if (!res.ok) throw new Error(`Context MCP returned ${res.status}`)
  const data = await res.json()
  cachedContext = JSON.stringify(data)
  return cachedContext
}

function buildContextUrl(suffix: string): string {
  const base = process.env.SANITY_CONTEXT_MCP_URL
  if (!base) throw new Error('Missing SANITY_CONTEXT_MCP_URL')
  // Strip trailing slash, append suffix before any query string
  const [path, qs] = base.split('?')
  return qs ? `${path.replace(/\/$/, '')}${suffix}?${qs}` : `${path.replace(/\/$/, '')}${suffix}`
}
```

### `app/api/search/route.ts`

Outline:
```
import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createMCPClient } from '@ai-sdk/mcp'
import { getInitialContext } from '@/lib/search-context'
import { SearchResponseSchema } from '@/lib/search-types'

POST /api/search
  Body: { query: string }

  1. Validate: query must be a non-empty string (max 300 chars). Return 400 otherwise.

  2. In parallel (Promise.all):
     a. getInitialContext() — fetches and caches schema context
     b. createMCPClient({ transport: { type: 'http', url: process.env.SANITY_CONTEXT_MCP_URL,
          headers: { Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}` } } })

  3. Get all tools from MCP client, exclude `initial_context` (already in system prompt):
     const { initial_context: _, ...mcpTools } = await mcpClient.tools()

  4. Call generateText with:
     - model: openai('gpt-4o')
     - system: SEARCH_SYSTEM_PROMPT (see below) with initialContext injected
     - messages: [{ role: 'user', content: query }]
     - tools: mcpTools
     - maxSteps: 10

  5. Close mcpClient (call mcpClient.close() in finally block)

  6. Parse generateText result.text as JSON, validate with SearchResponseSchema.
     If parse fails → return 502 with { error: 'Search model returned invalid output' }

  7. Return NextResponse.json(validated)
```

**System prompt (`SEARCH_SYSTEM_PROMPT`):**

```
You are Vertex Search, an intelligent search engine for a video learning platform. You have access to Sanity content via GROQ tools.

## Schema context (your available content)
{INITIAL_CONTEXT_PLACEHOLDER}

## What you must do

Given a user's search query, run GROQ queries to find matching content and return a structured JSON object.

## Two search paths — run BOTH in parallel

### Path 1 — Lesson search (match on title and notes)
Query lessons matching the topic. Use wildcards on each keyword, OR multiple terms.
- Title: `title match "*keyword*"`
- Notes (Portable Text): `pt::text(notes) match "*keyword*"`

Example for query "react hooks":
\`\`\`groq
*[_type == "lesson" && (
  title match "*react*" || title match "*hooks*" ||
  pt::text(notes) match "*react*" || pt::text(notes) match "*hooks*"
)] {
  _id, title, "slug": slug.current, keyPoints,
  "course": *[_type == "course" && references(^._id)][0] {
    _id, title, "slug": slug.current,
    "modules": modules[] {
      _key, title,
      "lessonRefs": lessons[]._ref
    }
  }
}
\`\`\`

### Path 2 — Video chapter search (chapters first, chunks as fallback)
Query video documents for matching chapter labels, then fallback to chunk text.

Example for query "react hooks":
\`\`\`groq
*[_type == "video" && (
  count(chapters[label match "*react*"]) > 0 ||
  count(chapters[label match "*hooks*"]) > 0
)] {
  _id, url,
  "matchedChapters": chapters[(label match "*react*") || (label match "*hooks*")]{
    startSeconds, label
  },
  "lesson": *[_type == "lesson" && videoUrl == ^.url][0] {
    _id, title, "slug": slug.current, thumbnail,
    "course": *[_type == "course" && references(^._id)][0] {
      title, "slug": slug.current,
      "modules": modules[] { _key, title, "lessonRefs": lessons[]._ref }
    }
  }
}
\`\`\`

If no chapter matches, fallback to chunks:
\`\`\`groq
*[_type == "video" && count(chunks) > 0] {
  _id, url,
  "matchedChunks": chunks[(text match "*react*") || (text match "*hooks*")][0...3] {
    startSeconds, text
  },
  "lesson": *[_type == "lesson" && videoUrl == ^.url][0] {
    _id, title, "slug": slug.current, thumbnail,
    "course": *[_type == "course" && references(^._id)][0] {
      title, "slug": slug.current,
      "modules": modules[] { _key, title, "lessonRefs": lessons[]._ref }
    }
  }
}
\`\`\`

## Ranking

Rank results best first:
1. Lesson title contains the exact concept
2. Video chapter label matches
3. Notes / transcript keyword match

## Computing labels

- `moduleLessonLabel`: Derive from order. Find which module the lesson belongs to (1-indexed) and the lesson's position within that module (1-indexed).
  - "Lesson 2.3 in Advanced Patterns" means module 2, lesson 3.
- `courseIcon`: First character of `courseTitle`, uppercased.

## CRITICAL RULES — never violate

1. Return only results that exist in the Sanity data. Never invent a course, lesson, timestamp, or count.
2. Never return the full `chunks` array. Fetch only the matched items.
3. A video result must always be tied to the lesson that embeds that video URL. Never surface a video document directly.
4. If no results match, return an empty array with `totalCount: 0` and `courseCount: 0`.
5. `totalCount` = total number of result objects in the array. `courseCount` = number of distinct courses represented.

## Output format

Respond with ONLY a valid JSON object — no prose, no markdown, no code fences. Schema:

{
  "results": [
    {
      "type": "lesson",
      "lessonSlug": "...",
      "lessonTitle": "...",
      "courseTitle": "...",
      "courseIcon": "N",
      "moduleLessonLabel": "Lesson 2.3 in Advanced Patterns",
      "keyPoints": ["...", "..."],
      "description": "One sentence explaining why this lesson matches."
    },
    {
      "type": "video",
      "lessonSlug": "...",
      "lessonTitle": "...",
      "courseTitle": "...",
      "courseIcon": "N",
      "moduleLessonLabel": "Lesson 2.3 in Advanced Patterns",
      "thumbnailUrl": "https://cdn.sanity.io/...",
      "description": "One sentence describing what is covered at this moment.",
      "matchedSecond": 312
    }
  ],
  "totalCount": 12,
  "courseCount": 3,
  "query": "the original user query"
}
```

### `studio/schemaTypes/video.ts`

```typescript
import { defineType, defineArrayMember, defineField } from 'sanity'

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  hidden: true, // internal — built by ingestion pipeline
  fields: [
    defineField({ name: 'id', type: 'string', title: 'Video ID', readOnly: true }),
    defineField({ name: 'url', type: 'url', title: 'Video URL', readOnly: true }),
    defineField({
      name: 'chapters',
      type: 'array',
      title: 'Chapters',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'startSeconds', type: 'number' }),
          defineField({ name: 'label', type: 'string' }),
        ],
      })],
    }),
    defineField({
      name: 'chunks',
      type: 'array',
      title: 'Transcript Chunks',
      of: [defineArrayMember({
        type: 'object',
        fields: [
          defineField({ name: 'startSeconds', type: 'number' }),
          defineField({ name: 'text', type: 'text' }),
        ],
      })],
    }),
  ],
})
```

### `studio/schemaTypes/index.ts`

Add `video` to the schema types array.

### `.env.example`

Add these two lines:
```
SANITY_CONTEXT_MCP_URL=https://api.sanity.io/v2026-03-03/context/mcp/YOUR_PROJECT_ID/YOUR_DATASET
OPENAI_API_KEY=
```

---

## Security considerations

- `OPENAI_API_KEY` and `SANITY_API_READ_TOKEN` are server-only env vars. The route is in `app/api/` — it runs server-side only. Never import `lib/search-context.ts` from a client component.
- The search route validates and sanitises user input (max length, string type) before passing it to the LLM. The LLM generates GROQ; it never receives raw user input as part of a GROQ string (the LLM composes the query, not string concatenation).
- `mcpClient.close()` is called in a `finally` block to prevent connection leaks.
- No write token is used; the MCP read token can only query published content.

---

## Acceptance criteria

1. `POST /api/search` with `{ "query": "react server components" }` returns a valid JSON body matching `SearchResponseSchema`.
2. `POST /api/search` with an empty or missing `query` returns HTTP 400.
3. When no Sanity lessons or video chapters match the query, the response has `results: []`, `totalCount: 0`.
4. When video documents exist, video results carry a `lessonSlug` that links to the lesson — not to the video document directly.
5. `courseIcon` is always a single uppercase letter.
6. `totalCount` equals the actual length of `results`.
7. The Studio schema deploys without TypeScript errors and the `video` type does not appear in the Studio nav.

---

## Checks to run

From `my-app/`:
```bash
bun add ai @ai-sdk/openai @ai-sdk/mcp zod
bun --cwd studio add zod  # only if studio uses it directly
bunx tsc --noEmit          # type check
bun run lint
bun run build              # full build (new /api route and new packages)
```

From `studio/`:
```bash
bun run deploy             # deploy schema (adds video type)
```

---

## Manual test steps

1. Add `SANITY_CONTEXT_MCP_URL` and `OPENAI_API_KEY` to `.env.local`.
2. Start the dev server: `bun run dev`
3. Test with a matching query:
   ```bash
   curl -X POST http://localhost:3000/api/search \
     -H "Content-Type: application/json" \
     -d '{"query": "data fetching"}'
   ```
   Expect: JSON with `results` array and non-negative counts.
4. Test with a nonsense query:
   ```bash
   curl -X POST http://localhost:3000/api/search \
     -H "Content-Type: application/json" \
     -d '{"query": "xzxzxzxzz"}'
   ```
   Expect: `{ results: [], totalCount: 0, courseCount: 0 }`.
5. Test validation:
   ```bash
   curl -X POST http://localhost:3000/api/search \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   Expect: HTTP 400.
6. Confirm no client-side token exposure: open the browser network panel on any page — `OPENAI_API_KEY` and `SANITY_API_READ_TOKEN` must not appear in any response.
