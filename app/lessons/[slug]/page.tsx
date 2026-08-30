import Link from "next/link"
import { notFound } from "next/navigation"

import type { PortableTextBlock } from "next-sanity"

import { Icon } from "@/app/components/Icon"
import { SiteHeader } from "@/app/components/SiteHeader"
import { getLessonPage, getLessonSlugs } from "@/sanity/lib/data"

import { LessonTabs } from "./LessonTabs"

export const revalidate = 60

export async function generateStaticParams() {
  const slugs = await getLessonSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ start?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const data = await getLessonPage(slug)
  if (!data) return { title: "Lesson not found" }
  return {
    title: `${data.lesson.title} — Vertex`,
    description: data.lesson.keyPoints[0] ?? "",
  }
}

export default async function LessonPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { start } = await searchParams
  const data = await getLessonPage(slug)
  if (!data) notFound()

  const videoId = extractYouTubeId(data.lesson.videoUrl)
  const startSeconds = typeof start === "string" ? Math.max(0, parseInt(start, 10)) : 0
  const embedSrc = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1${startSeconds > 0 ? `&start=${startSeconds}` : ""}`
    : null

  return (
    <div className="lesson-page-root">
      <SiteHeader />
      <div className="lesson-layout">
        {/* ── Sidebar ── */}
        <aside className="lesson-sidebar" aria-label="Course navigation">
          <div className="lesson-sidebar-course">
            <span className="lesson-course-icon" aria-hidden="true">
              {data.courseTitle[0].toUpperCase()}
            </span>
            <div className="lesson-course-info">
              <span className="lesson-course-title">{data.courseTitle}</span>
              <span className="lesson-module-label">
                Module {data.moduleIndex} of {data.totalModules}
              </span>
            </div>
          </div>

          <ol className="lesson-sidebar-list" aria-label={`Lessons in ${data.moduleTitle}`}>
            {data.moduleLessons.map((sibling, i) => (
              <li key={sibling._id}>
                <Link
                  href={`/lessons/${sibling.slug}`}
                  className={`lesson-sidebar-row${sibling.slug === slug ? " lesson-sidebar-row--active" : ""}`}
                  aria-current={sibling.slug === slug ? "page" : undefined}
                >
                  <span className="lesson-sidebar-num">
                    {data.moduleIndex}.{i + 1}
                  </span>
                  <span className="lesson-sidebar-title">{sibling.title}</span>
                </Link>
              </li>
            ))}
          </ol>
        </aside>

        {/* ── Main ── */}
        <div className="lesson-main">
          <nav className="course-crumbs lesson-crumbs" aria-label="Breadcrumb">
            <Link href="/courses">All Courses</Link>
            <span aria-hidden="true">&gt;</span>
            <Link href={`/courses/${data.courseSlug}`}>{data.courseTitle}</Link>
            <span aria-hidden="true">&gt;</span>
            <span>{data.moduleTitle}</span>
            <span aria-hidden="true">&gt;</span>
            <span>{data.lesson.title}</span>
          </nav>

          <div className="lesson-video-wrap">
            {embedSrc ? (
              <iframe
                className="lesson-video-frame"
                src={embedSrc}
                title={data.lesson.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="lesson-video-fallback">Video unavailable</div>
            )}
          </div>

          <LessonTabs
            notes={data.lesson.notes as PortableTextBlock[]}
            keyPoints={data.lesson.keyPoints}
            proTip={data.lesson.proTip}
            resources={data.lesson.resources}
          />

          <div className="lesson-nav-bar">
            {data.prevLesson ? (
              <Link href={`/lessons/${data.prevLesson.slug}`} className="lesson-nav-prev">
                <Icon name="arrow" size={16} style={{ transform: "rotate(180deg)" }} />
                <div>
                  <span className="lesson-nav-label">Previous Lesson</span>
                  <span className="lesson-nav-title">{data.prevLesson.title}</span>
                </div>
              </Link>
            ) : (
              <div />
            )}
            <Link
              href={
                data.nextLesson ? `/lessons/${data.nextLesson.slug}` : `/courses/${data.courseSlug}`
              }
              className="primary-action"
            >
              {data.nextLesson ? "Continue" : "Back to Course"}
              <Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/[?&]v=([^&]+)/)
  return match?.[1] ?? null
}
