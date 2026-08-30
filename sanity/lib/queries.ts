import {defineQuery} from 'next-sanity'

const imageFields = /* groq */ `
  asset->{
    _id,
    url,
    metadata {lqip, dimensions}
  },
  alt
`

const instructorFields = /* groq */ `
  _id,
  name,
  "slug": slug.current,
  photo {${imageFields}},
  expertise,
  bio
`

const categoryFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  description
`

const lessonCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  "durationSeconds": coalesce(durationSeconds, duration),
  freePreview,
  studentCount,
  thumbnail {${imageFields}},
  keyPoints
`

export const COURSE_CATALOG_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && defined(slug.current)]
  | order(popular desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage {${imageFields}},
    level,
    price,
    popular,
    studentCount,
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons),
    instructor->{name, "slug": slug.current, photo {${imageFields}}},
    category->{title, "slug": slug.current}
  }
`)

export const COURSE_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage {${imageFields}},
    level,
    price,
    popular,
    studentCount,
    learningOutcomes[]{_key, icon, title, description},
    instructor->{${instructorFields}},
    category->{${categoryFields}},
    modules[]{
      _key,
      title,
      summary,
      "lessons": lessons[]->{${lessonCardFields}}
    }
  }
`)

export const LESSON_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    thumbnail {${imageFields}},
    "durationSeconds": coalesce(durationSeconds, duration),
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources[]{_key, type, title, description, url},
    "course": *[_type == "course" && references(^._id)][0]{
      _id,
      title,
      "slug": slug.current,
      instructor->{${instructorFields}},
      "modules": modules[]{
        _key,
        title,
        summary,
        "lessonIds": lessons[]._ref
      }
    }
  }
`)

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor" && slug.current == $slug][0] {
    ${instructorFields},
    "courses": *[_type == "course" && instructor._ref == ^._id]
    | order(popular desc, title asc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      coverImage {${imageFields}},
      level,
      price,
      popular,
      studentCount,
      "moduleCount": count(modules),
      "lessonCount": count(modules[].lessons),
      category->{title, "slug": slug.current}
    }
  }
`)

export const CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[_type == "category" && defined(slug.current)]
  | order(title asc) {${categoryFields}}
`)

export const COURSE_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && defined(slug.current)]{"slug": slug.current}
`)

export const LESSON_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && defined(slug.current)]{"slug": slug.current}
`)

export const INSTRUCTOR_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor" && defined(slug.current)]{"slug": slug.current}
`)
