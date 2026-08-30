import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Icon, type IconName } from "@/app/components/Icon"
import { SiteHeader } from "@/app/components/SiteHeader"
import { getCourseBySlug, getCourseSlugs, type CourseDetail } from "@/sanity/lib/data"
import {
  formatDuration,
  formatLevel,
  formatStudentCount,
} from "@/sanity/lib/format"
import { urlFor } from "@/sanity/lib/image"

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getCourseSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps<"/courses/[slug]">) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) return { title: "Course not found" }
  return {
    title: `${course.title} — Vertex`,
    description: course.summary,
  }
}

export default async function CoursePage({
  params,
}: PageProps<"/courses/[slug]">) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) notFound()

  const totalLessons = course.modules.reduce(
    (sum, module) => sum + module.lessons.length,
    0,
  )
  const totalSeconds = course.modules.reduce(
    (sum, module) =>
      sum + module.lessons.reduce((s, lesson) => s + (lesson.durationSeconds ?? 0), 0),
    0,
  )
  const firstLesson = course.modules[0]?.lessons[0]
  const continueHref = firstLesson ? `/lessons/${firstLesson.slug}` : "#"

  return (
    <main className="home-page course-page">
      <SiteHeader activeNav="courses" />

      <nav className="course-crumbs" aria-label="Breadcrumb">
        <Link href="/#courses">All Courses</Link>
        <span aria-hidden="true">/</span>
        <span>{course.title}</span>
      </nav>

      <section className="course-hero">
        <div className="course-cover">
          <Image
            src={coverImageUrl(course)}
            alt={course.coverImage.alt ?? course.title}
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            preload
          />
        </div>
        <div className="course-hero-body">
          {course.popular ? <span className="popular-pill">POPULAR</span> : null}
          <h1>{course.title}</h1>
          <p>{course.summary}</p>
          <ul className="course-meta-row" aria-label="Course details">
            <li>
              <Icon name="chart" size={18} />
              {formatLevel(course.level)}
            </li>
            <li>
              <Icon name="clock" size={18} />
              {formatDuration(totalSeconds)}
            </li>
            <li>
              <Icon name="file" size={18} />
              {totalLessons} lessons
            </li>
            <li>
              <Icon name="star" size={18} />
              {formatStudentCount(course.studentCount)}
            </li>
          </ul>
          <div className="course-actions">
            <Link className="primary-action" href={continueHref}>
              Continue Learning
              <Icon name="arrow" size={20} />
            </Link>
            <button className="secondary-action" type="button">
              <Icon name="bookmark" size={18} />
              Bookmark
            </button>
          </div>
        </div>
      </section>

      <section className="learn-section" aria-labelledby="learn-heading">
        <h2 id="learn-heading">What you&apos;ll learn</h2>
        <ul className="learn-grid">
          {course.learningOutcomes.map((outcome) => (
            <li className="learn-card" key={outcome._key}>
              <span className="learn-icon">
                <Icon name={mapOutcomeIcon(outcome.icon)} size={22} />
              </span>
              <div>
                <h3>{outcome.title}</h3>
                <p>{outcome.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="content-section" aria-labelledby="content-heading">
        <header className="content-header">
          <h2 id="content-heading">Course Content</h2>
          <span className="content-meta">
            {totalLessons} lessons &middot; {formatDuration(totalSeconds)}
          </span>
        </header>
        <ol className="module-list">
          {course.modules.map((module, moduleIndex) => {
            const moduleSeconds = module.lessons.reduce(
              (s, lesson) => s + (lesson.durationSeconds ?? 0),
              0,
            )
            return (
              <li key={module._key}>
                <details className="module-item" open={moduleIndex === 0}>
                  <summary>
                    <span className="module-index">{module.index}</span>
                    <span className="module-titles">
                      <span className="module-title">{module.title}</span>
                      <span className="module-summary">{module.summary}</span>
                    </span>
                    <span className="module-duration">
                      {formatDuration(moduleSeconds)}
                    </span>
                    <span className="module-chevron" aria-hidden="true">
                      <Icon name="chevron-down" size={20} />
                    </span>
                  </summary>
                  <ol className="lesson-list">
                    {module.lessons.map((lesson) => (
                      <li key={lesson._id}>
                        <Link
                          className="lesson-row"
                          href={`/lessons/${lesson.slug}`}
                        >
                          <span className="lesson-index">
                            {module.index}.{lesson.index}
                          </span>
                          <span className="lesson-title">{lesson.title}</span>
                          {lesson.freePreview ? (
                            <span className="free-badge">Free preview</span>
                          ) : null}
                          <span className="lesson-duration">
                            {formatDuration(lesson.durationSeconds, "short")}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </details>
              </li>
            )
          })}
        </ol>
      </section>

      <div className="course-sticky-bar" role="complementary">
        <div className="sticky-progress">
          <div className="progress-track-lg" aria-hidden="true">
            <span style={{ width: "40%" }} />
          </div>
          <span className="progress-label">
            <strong>40%</strong> complete
          </span>
        </div>
        <Link className="primary-action" href={continueHref}>
          Continue Learning
          <Icon name="arrow" size={20} />
        </Link>
      </div>
    </main>
  )
}

function coverImageUrl(course: CourseDetail): string {
  const asset = course.coverImage.asset
  if (!asset) return ""
  return urlFor(course.coverImage).width(1200).height(800).fit("crop").url()
}

const OUTCOME_ICON_MAP: Record<string, IconName> = {
  code: "code",
  layers: "layers",
  rocket: "rocket",
  sparkles: "sparkles",
  target: "target",
  gauge: "gauge",
  workflow: "workflow",
  puzzle: "puzzle",
  shield: "shield",
}

function mapOutcomeIcon(icon: string): IconName {
  return OUTCOME_ICON_MAP[icon] ?? "sparkles"
}
