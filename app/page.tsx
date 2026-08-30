import Link from "next/link"

import { getCourseCatalog } from "@/sanity/lib/data"
import { CourseCard } from "./components/CourseCard"
import { Icon } from "./components/Icon"
import { SiteHeader } from "./components/SiteHeader"

export const revalidate = 60

export default async function Home() {
  const courses = await getCourseCatalog()
  const featured = courses.slice(0, 3)

  return (
    <main className="home-page">
      <SiteHeader activeNav="courses" />
      <section className="home-hero" id="learning">
        <div className="hero-badge">INTELLIGENT LEARNING</div>
        <h1>
          Search your learning
          <br />
          in plain English.
        </h1>
        <p>
          Vertex understands what you want to learn and
          <br className="desktop-break" /> finds the exact lessons across all your
          courses.
        </p>
        <a className="explore-button" href="#courses">
          Explore Courses <Icon name="arrow" size={24} />
        </a>
        <label className="home-search" htmlFor="learning-search">
          <Icon name="search" size={31} />
          <input
            id="learning-search"
            placeholder="Ask anything about your learning..."
          />
          <kbd>⌘ K</kbd>
        </label>
      </section>
      <section className="courses-section" id="courses">
        <div className="section-top">
          <h2>All Courses</h2>
          <Link href="/courses">
            View all courses <Icon name="arrow" size={20} />
          </Link>
        </div>
        <div className="course-grid">
          {featured.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      </section>
      <section className="home-footer-art">
        <div className="weekly-callout">
          <span />
          <div>
            <Icon name="star" size={25} />
            <p>New courses and lessons added every week.</p>
          </div>
          <span />
        </div>
        <div className="bar-art" aria-hidden="true">
          {[38, 70, 102, 135, 87, 58, 31, 69, 92, 121, 84, 54, 112, 96, 74].map(
            (height, index) => (
              <i key={index} style={{ height: `${height}px` }} />
            ),
          )}
        </div>
      </section>
    </main>
  )
}
