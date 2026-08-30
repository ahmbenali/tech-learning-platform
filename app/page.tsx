import { Icon } from "./components/Icon"
import { SiteHeader } from "./components/SiteHeader"

const courses = [
  {
    title: "Next.js for Production",
    description: "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate",
    duration: "18h 24m",
    modules: "12 modules",
    mark: "N",
    tone: "next",
  },
  {
    title: "Docker Essentials",
    description: "Containerize applications and streamline your development workflow.",
    level: "Beginner",
    duration: "10h 12m",
    modules: "8 modules",
    mark: "docker",
    tone: "docker",
  },
  {
    title: "TypeScript Deep Dive",
    description: "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate",
    duration: "14h 36m",
    modules: "10 modules",
    mark: "TS",
    tone: "typescript",
  },
]

function CourseCard({ course }: { course: (typeof courses)[number] }) {
  return (
    <article className="home-course-card">
      <div className={`course-mark ${course.tone}`}>
        {course.mark === "docker" ? (
          <span className="docker-mark">
            <i />
            <i />
            <i />
            <b />
          </span>
        ) : (
          course.mark
        )}
      </div>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className="course-meta">
        <span>
          <Icon name="chart" size={17} />
          {course.level}
        </span>
        <span>
          <Icon name="clock" size={17} />
          {course.duration}
        </span>
        <span>
          <Icon name="file" size={17} />
          {course.modules}
        </span>
      </div>
    </article>
  )
}

export default function Home() {
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
          <a href="#courses">
            View all courses <Icon name="arrow" size={20} />
          </a>
        </div>
        <div className="course-grid">
          {courses.map((course) => (
            <CourseCard key={course.title} course={course} />
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
