import 'server-only'

import { NextRequest, NextResponse } from 'next/server'
import { generateText, isStepCount, Output } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createMCPClient } from '@ai-sdk/mcp'

import { getInitialContext } from '@/lib/search-context'
import { SearchResponseSchema } from '@/lib/search-types'

const SEARCH_SYSTEM_PROMPT = (initialContext: string) => `
You are Vertex Search, an intelligent search engine for a video learning platform.
You have access to Sanity content via GROQ tools. Your job is to search for relevant lessons and video moments, then return a structured JSON object.

## Schema context (your available content)
${initialContext}

## Two search paths — run BOTH

### Path 1: Lesson search (match on title and plain-text notes)
Search lessons by topic. Wildcard each keyword and OR multiple terms.
- Title match: title match "*keyword*"
- Notes (Portable Text): pt::text(notes) match "*keyword*"

For query "react hooks":
  *[_type == "lesson" && (
    title match "*react*" || title match "*hooks*" ||
    pt::text(notes) match "*react*" || pt::text(notes) match "*hooks*"
  )] {
    _id, title, "slug": slug.current, keyPoints,
    "thumbnailUrl": thumbnail.asset->url,
    "course": *[_type == "course" && references(^._id)][0] {
      _id, title, "slug": slug.current,
      "modules": modules[] { _key, title, "lessonRefs": lessons[]._ref }
    }
  }

### Path 2: Video chapter search (chapters first, chunks as fallback)
For query "react hooks" — chapters:
  *[_type == "video" && (
    count(chapters[label match "*react*"]) > 0 ||
    count(chapters[label match "*hooks*"]) > 0
  )] {
    _id, url,
    "matchedChapters": chapters[(label match "*react*") || (label match "*hooks*")] {
      startSeconds, label
    },
    "lesson": *[_type == "lesson" && videoUrl == ^.url][0] {
      _id, title, "slug": slug.current,
      "thumbnailUrl": thumbnail.asset->url,
      "course": *[_type == "course" && references(^._id)][0] {
        title, "slug": slug.current,
        "modules": modules[] { _key, title, "lessonRefs": lessons[]._ref }
      }
    }
  }

If no chapter matches, fallback to chunks:
  *[_type == "video" && (
    count(chunks[text match "*react*"]) > 0 ||
    count(chunks[text match "*hooks*"]) > 0
  )] {
    _id, url,
    "matchedChunks": chunks[(text match "*react*") || (text match "*hooks*")][0...3] {
      startSeconds, text
    },
    "lesson": *[_type == "lesson" && videoUrl == ^.url][0] {
      _id, title, "slug": slug.current,
      "thumbnailUrl": thumbnail.asset->url,
      "course": *[_type == "course" && references(^._id)][0] {
        title, "slug": slug.current,
        "modules": modules[] { _key, title, "lessonRefs": lessons[]._ref }
      }
    }
  }

## Computing labels

moduleLessonLabel: Derive from order. Find the lesson's module (1-indexed) and its position within that module (1-indexed).
  - A lesson whose _id appears at index 2 in module 1's lessonRefs array → module 1, lesson 3 → "Lesson 1.3 in Module Title"
courseIcon: First character of courseTitle, uppercased.

## Ranking (best first)

1. Lesson title contains the exact concept
2. Video chapter label matches
3. Notes / transcript keyword match

## CRITICAL RULES — never violate

1. Only return results that exist in Sanity. Never invent a course, lesson, module, timestamp, or count.
2. Never return a full chunks array. Fetch only the matched items (use [0...3] at most).
3. A video result must always link to the lesson that embeds that video URL. Never surface a video document directly.
4. totalCount = number of result objects in the array. courseCount = number of distinct courses.
5. When nothing matches, return results: [], totalCount: 0, courseCount: 0.
6. Never match whole phrases as one token. Always wildcard per keyword.

## Output

Respond with ONLY a valid JSON object — no prose, no markdown, no code fences:
{
  "results": [
    {
      "type": "lesson",
      "lessonSlug": "...",
      "lessonTitle": "...",
      "courseTitle": "...",
      "courseIcon": "N",
      "moduleLessonLabel": "Lesson 2.3 in State Management",
      "keyPoints": ["...", "..."],
      "description": "One sentence explaining why this lesson matches."
    },
    {
      "type": "video",
      "lessonSlug": "...",
      "lessonTitle": "...",
      "courseTitle": "...",
      "courseIcon": "N",
      "moduleLessonLabel": "Lesson 2.3 in State Management",
      "thumbnailUrl": "https://cdn.sanity.io/...",
      "description": "One sentence describing what is covered at this moment.",
      "matchedSecond": 312
    }
  ],
  "totalCount": 5,
  "courseCount": 2,
  "query": "the original user query"
}
`

export async function POST(req: NextRequest) {
  let query: unknown
  try {
    const body = await req.json()
    query = body?.query
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof query !== 'string' || query.trim().length === 0) {
    return NextResponse.json({ error: 'query must be a non-empty string' }, { status: 400 })
  }

  if (query.length > 300) {
    return NextResponse.json({ error: 'query must be 300 characters or fewer' }, { status: 400 })
  }

  const mcpUrl = process.env.SANITY_CONTEXT_MCP_URL
  if (!mcpUrl) {
    return NextResponse.json({ error: 'Search not configured' }, { status: 503 })
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    return NextResponse.json({ error: 'Search not configured' }, { status: 503 })
  }

  const openai = createOpenAI({ apiKey: openaiKey })

  let mcpClient: Awaited<ReturnType<typeof createMCPClient>> | null = null

  try {
    const [initialContext, client] = await Promise.all([
      getInitialContext(),
      createMCPClient({
        transport: {
          type: 'http',
          url: mcpUrl,
          headers: {
            Authorization: `Bearer ${process.env.SANITY_API_READ_TOKEN}`,
          },
        },
      }),
    ])

    mcpClient = client

    const allTools = await mcpClient.tools()
    // Exclude initial_context — its data is already in the system prompt
    const mcpTools = Object.fromEntries(
      Object.entries(allTools).filter(([name]) => name !== 'initial_context')
    )

    const result = await generateText({
      model: openai('gpt-4o'),
      system: SEARCH_SYSTEM_PROMPT(initialContext),
      messages: [{ role: 'user', content: query.trim() }],
      tools: mcpTools as Parameters<typeof generateText>[0]['tools'],
      stopWhen: isStepCount(10),
      output: Output.json(),
    })

    const validated = SearchResponseSchema.safeParse(result.output)
    if (!validated.success) {
      console.error('Search response failed validation:', validated.error.issues)
      console.error('Raw output:', JSON.stringify(result.output).slice(0, 500))
      return NextResponse.json({ error: 'Search model returned invalid output' }, { status: 502 })
    }

    return NextResponse.json(validated.data)
  } catch (err) {
    console.error('Search route error:', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  } finally {
    await mcpClient?.close()
  }
}
