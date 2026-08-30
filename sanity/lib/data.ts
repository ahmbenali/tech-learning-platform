import 'server-only'

import {cache} from 'react'

import {sanityFetch} from './fetch'
import {
  CATEGORIES_QUERY,
  COURSE_BY_SLUG_QUERY,
  COURSE_CATALOG_QUERY,
  COURSE_SLUGS_QUERY,
  INSTRUCTOR_BY_SLUG_QUERY,
  INSTRUCTOR_SLUGS_QUERY,
  LESSON_BY_SLUG_QUERY,
  LESSON_PAGE_QUERY,
  LESSON_SLUGS_QUERY,
} from './queries'

export type SanityImage = {
  alt?: string
  asset?: {
    _id: string
    url: string
    metadata?: {
      lqip?: string
      dimensions?: {
        width: number
        height: number
        aspectRatio?: number
      }
    }
  }
}

export type Category = {
  _id: string
  title: string
  slug: string
  description: string
}

export type Instructor = {
  _id: string
  name: string
  slug: string
  photo: SanityImage
  expertise: string[]
  bio: string
}

export type CourseCatalogItem = {
  _id: string
  title: string
  slug: string
  summary: string
  coverImage: SanityImage
  level: 'beginner' | 'intermediate' | 'advanced'
  price: number
  popular?: boolean
  studentCount: number
  moduleCount: number
  lessonCount: number
  instructor: Pick<Instructor, 'name' | 'slug' | 'photo'>
  category: Pick<Category, 'title' | 'slug'>
}

export type LessonCard = {
  _id: string
  title: string
  slug: string
  durationSeconds: number
  freePreview?: boolean
  studentCount: number
  thumbnail: SanityImage
  keyPoints: string[]
}

export type CourseDetail = Omit<CourseCatalogItem, 'moduleCount' | 'lessonCount'> & {
  learningOutcomes: Array<{
    _key: string
    icon: string
    title: string
    description: string
  }>
  instructor: Instructor
  category: Category
  modules: Array<{
    _key: string
    title: string
    summary: string
    index: number
    lessons: Array<LessonCard & {index: number}>
  }>
}

export type LessonDetail = {
  _id: string
  title: string
  slug: string
  videoUrl: string
  thumbnail: SanityImage
  durationSeconds: number
  freePreview?: boolean
  studentCount: number
  notes: unknown[]
  keyPoints: string[]
  proTip?: string
  resources: Array<{
    _key: string
    type: 'article' | 'code' | 'download' | 'link'
    title: string
    description: string
    url: string
  }>
  course: {
    _id: string
    title: string
    slug: string
    instructor: Instructor
  } | null
  module: {
    _key: string
    title: string
    summary: string
    index: number
    lessonIndex: number
  } | null
}

export type InstructorDetail = Instructor & {
  courses: CourseCatalogItem[]
}

type CourseDetailRaw = Omit<CourseDetail, 'modules'> & {
  modules: Array<{
    _key: string
    title: string
    summary: string
    lessons: LessonCard[]
  }>
}

type LessonDetailRaw = Omit<LessonDetail, 'course' | 'module'> & {
  course: {
    _id: string
    title: string
    slug: string
    instructor: Instructor
    modules: Array<{
      _key: string
      title: string
      summary: string
      lessonIds: string[]
    }>
  } | null
}

export type ModuleSiblingLesson = {
  _id: string
  title: string
  slug: string
  durationSeconds: number
}

export type LessonPageData = {
  lesson: Omit<LessonDetail, 'course' | 'module'>
  courseId: string
  courseTitle: string
  courseSlug: string
  moduleIndex: number
  totalModules: number
  moduleTitle: string
  lessonIndexInModule: number
  moduleLessons: ModuleSiblingLesson[]
  prevLesson: ModuleSiblingLesson | null
  nextLesson: ModuleSiblingLesson | null
}

type LessonPageRaw = Omit<LessonDetail, 'course' | 'module'> & {
  course: {
    _id: string
    title: string
    slug: string
    moduleCount: number
    modules: Array<{
      _key: string
      title: string
      summary: string
      lessonIds: string[]
      lessons: ModuleSiblingLesson[]
    }>
  } | null
}

export const getCourseCatalog = cache(async (): Promise<CourseCatalogItem[]> =>
  sanityFetch<CourseCatalogItem[]>(COURSE_CATALOG_QUERY),
)

export const getCourseBySlug = cache(async (slug: string): Promise<CourseDetail | null> => {
  const course = await sanityFetch<CourseDetailRaw | null>(COURSE_BY_SLUG_QUERY, {
    params: {slug},
  })

  if (!course) return null

  return {
    ...course,
    modules: course.modules.map((module, moduleIndex) => ({
      ...module,
      index: moduleIndex + 1,
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        ...lesson,
        index: lessonIndex + 1,
      })),
    })),
  }
})

export const getLessonBySlug = cache(async (slug: string): Promise<LessonDetail | null> => {
  const lesson = await sanityFetch<LessonDetailRaw | null>(LESSON_BY_SLUG_QUERY, {
    params: {slug},
  })

  if (!lesson) return null

  const moduleIndex = lesson.course?.modules.findIndex((module) =>
    module.lessonIds.includes(lesson._id),
  ) ?? -1
  const parentModule = moduleIndex >= 0 ? lesson.course?.modules[moduleIndex] : null
  const lessonIndex = parentModule ? parentModule.lessonIds.indexOf(lesson._id) : -1

  return {
    ...lesson,
    course: lesson.course
      ? {
          _id: lesson.course._id,
          title: lesson.course.title,
          slug: lesson.course.slug,
          instructor: lesson.course.instructor,
        }
      : null,
    module: parentModule
      ? {
          _key: parentModule._key,
          title: parentModule.title,
          summary: parentModule.summary,
          index: moduleIndex + 1,
          lessonIndex: lessonIndex + 1,
        }
      : null,
  }
})

export const getLessonPage = cache(async (slug: string): Promise<LessonPageData | null> => {
  const raw = await sanityFetch<LessonPageRaw | null>(LESSON_PAGE_QUERY, {params: {slug}})
  if (!raw || !raw.course) return null

  const {course, ...lessonFields} = raw

  const moduleIndex = course.modules.findIndex((m) => m.lessonIds.includes(raw._id))
  if (moduleIndex < 0) return null

  const parentModule = course.modules[moduleIndex]
  const lessonIndexInModule = parentModule.lessonIds.indexOf(raw._id)
  const moduleLessons = parentModule.lessons
  const prevLesson = lessonIndexInModule > 0 ? moduleLessons[lessonIndexInModule - 1] : null
  const nextLesson =
    lessonIndexInModule < moduleLessons.length - 1 ? moduleLessons[lessonIndexInModule + 1] : null

  return {
    lesson: lessonFields,
    courseId: course._id,
    courseTitle: course.title,
    courseSlug: course.slug,
    moduleIndex: moduleIndex + 1,
    totalModules: course.moduleCount,
    moduleTitle: parentModule.title,
    lessonIndexInModule: lessonIndexInModule + 1,
    moduleLessons,
    prevLesson,
    nextLesson,
  }
})

export const getInstructorBySlug = cache(async (slug: string): Promise<InstructorDetail | null> =>
  sanityFetch<InstructorDetail | null>(INSTRUCTOR_BY_SLUG_QUERY, {params: {slug}}),
)

export const getCategories = cache(async (): Promise<Category[]> =>
  sanityFetch<Category[]>(CATEGORIES_QUERY),
)

export const getCourseSlugs = cache(async (): Promise<Array<{slug: string}>> =>
  sanityFetch<Array<{slug: string}>>(COURSE_SLUGS_QUERY),
)

export const getLessonSlugs = cache(async (): Promise<Array<{slug: string}>> =>
  sanityFetch<Array<{slug: string}>>(LESSON_SLUGS_QUERY),
)

export const getInstructorSlugs = cache(async (): Promise<Array<{slug: string}>> =>
  sanityFetch<Array<{slug: string}>>(INSTRUCTOR_SLUGS_QUERY),
)
