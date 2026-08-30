import { z } from 'zod'

export const VideoResultSchema = z.object({
  type: z.literal('video'),
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  courseTitle: z.string(),
  courseIcon: z.string(),
  moduleLessonLabel: z.string(),
  thumbnailUrl: z.string().nullable(),
  description: z.string(),
  matchedSecond: z.number().int().min(0),
})

export const LessonResultSchema = z.object({
  type: z.literal('lesson'),
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  courseTitle: z.string(),
  courseIcon: z.string(),
  moduleLessonLabel: z.string(),
  keyPoints: z.array(z.string()),
  description: z.string(),
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
