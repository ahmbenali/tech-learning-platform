import Link from "next/link"

import type { CourseCatalogItem } from "@/sanity/lib/data"
import { formatLevel } from "@/sanity/lib/format"
import { Icon } from "./Icon"

type MarkInfo = { mark: string; tone: string }

const KEYWORD_MARKS: Array<{ re: RegExp } & MarkInfo> = [
  { re: /next\.?js/i,           mark: "N",      tone: "next" },
  { re: /typescript/i,          mark: "TS",     tone: "typescript" },
  { re: /react/i,               mark: "R",      tone: "react" },
  { re: /docker/i,              mark: "docker", tone: "docker" },
  { re: /python/i,              mark: "Py",     tone: "python" },
  { re: /\bai\b|llm/i,         mark: "AI",     tone: "ai" },
  { re: /postgresql|postgres/i, mark: "PG",     tone: "postgres" },
  { re: /kubernetes/i,          mark: "K8s",    tone: "devops" },
  { re: /security/i,            mark: "Sec",    tone: "security" },
  { re: /system design/i,       mark: "SD",     tone: "default" },
]

function getMarkInfo(title: string): MarkInfo {
  for (const { re, mark, tone } of KEYWORD_MARKS) {
    if (re.test(title)) return { mark, tone }
  }
  const words = title.trim().split(/\s+/)
  const mark =
    words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : title.slice(0, 2).toUpperCase()
  return { mark, tone: "default" }
}

export function CourseCard({ course }: { course: CourseCatalogItem }) {
  const { mark, tone } = getMarkInfo(course.title)

  return (
    <Link href={`/courses/${course.slug}`}>
      <article className="home-course-card">
        <div className={`course-mark ${tone}`}>
          {mark === "docker" ? (
            <span className="docker-mark">
              <i />
              <i />
              <i />
              <b />
            </span>
          ) : (
            mark
          )}
        </div>
        <h3>{course.title}</h3>
        <p>{course.summary}</p>
        <div className="course-meta">
          <span>
            <Icon name="chart" size={17} />
            {formatLevel(course.level)}
          </span>
          <span>
            <Icon name="file" size={17} />
            {course.lessonCount} lessons
          </span>
          <span>
            <Icon name="layers" size={17} />
            {course.moduleCount} modules
          </span>
        </div>
      </article>
    </Link>
  )
}
