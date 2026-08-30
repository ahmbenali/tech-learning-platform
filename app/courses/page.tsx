import type { Metadata } from "next"

import { CourseCard } from "@/app/components/CourseCard"
import { SiteHeader } from "@/app/components/SiteHeader"
import { getCourseCatalog } from "@/sanity/lib/data"

export const revalidate = 60

export const metadata: Metadata = {
  title: "All Courses — Vertex",
  description: "Browse every course on Vertex.",
}

export default async function CoursesPage() {
  const courses = await getCourseCatalog()

  return (
    <main className="home-page">
      <SiteHeader activeNav="courses" />
      <section className="courses-section catalog-section">
        <div className="section-top">
          <h2>All Courses</h2>
          <span>{courses.length} courses</span>
        </div>
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>
    </main>
  )
}
