import Link from "next/link";

type IconProps = { name: "bell" | "search" | "arrow" | "chart" | "clock" | "file" | "star"; size?: number };

/**
 * Renders a named inline SVG icon.
 *
 * @param name - The icon to render
 * @param size - The icon dimensions in pixels
 */
function Icon({ name, size = 22 }: IconProps) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const shapes = {
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    arrow: <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
    chart: <><path d="M5 20V12M12 20V7M19 20V4" /><path d="M3 20h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h4M9 13h6M9 17h6" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />,
  };
  return <svg {...common}>{shapes[name]}</svg>;
}

function VertexMark() {
  return <span className="home-vertex-mark" aria-hidden="true"><svg viewBox="0 0 32 28" fill="none"><path d="M2 2h28L16 27 2 2Z" fill="currentColor" /><path d="m10 7 6 11 6-11h-5l-1 3-1-3h-5Z" fill="white" /></svg></span>;
}

const courses = [
  { title: "Next.js for Production", description: "Build scalable, high-performance web applications with Next.js.", level: "Intermediate", duration: "18h 24m", modules: "12 modules", mark: "N", tone: "next" },
  { title: "Docker Essentials", description: "Containerize applications and streamline your development workflow.", level: "Beginner", duration: "10h 12m", modules: "8 modules", mark: "docker", tone: "docker" },
  { title: "TypeScript Deep Dive", description: "Go beyond the basics and write safer, more expressive code.", level: "Intermediate", duration: "14h 36m", modules: "10 modules", mark: "TS", tone: "typescript" },
];

/**
 * Renders a course card with its branding, description, and learning metadata.
 *
 * @param course - The course details displayed in the card.
 */
function CourseCard({ course }: { course: (typeof courses)[number] }) {
  return <article className="home-course-card">
    <div className={`course-mark ${course.tone}`}>{course.mark === "docker" ? <span className="docker-mark"><i /><i /><i /><b /></span> : course.mark}</div>
    <h3>{course.title}</h3>
    <p>{course.description}</p>
    <div className="course-meta"><span><Icon name="chart" size={17} />{course.level}</span><span><Icon name="clock" size={17} />{course.duration}</span><span><Icon name="file" size={17} />{course.modules}</span></div>
  </article>;
}

/**
 * Renders the Vertex learning platform home page.
 */
export default function Home() {
  return <main className="home-page">
    <header className="home-header">
      <Link className="home-brand" href="/"><VertexMark /><span>Vertex</span></Link>
      <nav className="home-nav" aria-label="Main navigation"><a className="active" href="#courses">Courses</a><a href="#learning">My Learning</a></nav>
      <div className="home-actions"><button className="icon-button" aria-label="Notifications"><Icon name="bell" size={24} /></button><button className="profile-button" aria-label="Open profile"><span /></button></div>
    </header>
    <section className="home-hero">
      <div className="hero-badge">INTELLIGENT LEARNING</div>
      <h1>Search your learning<br />in plain English.</h1>
      <p>Vertex understands what you want to learn and<br className="desktop-break" /> finds the exact lessons across all your courses.</p>
      <a className="explore-button" href="#courses">Explore Courses <Icon name="arrow" size={24} /></a>
      <label className="home-search" htmlFor="learning-search"><Icon name="search" size={31} /><input id="learning-search" placeholder="Ask anything about your learning..." /><kbd>⌘ K</kbd></label>
    </section>
    <section className="courses-section" id="courses"><div className="section-top"><h2>All Courses</h2><a href="#courses">View all courses <Icon name="arrow" size={20} /></a></div><div className="course-grid">{courses.map((course) => <CourseCard key={course.title} course={course} />)}</div></section>
    <section className="home-footer-art"><div className="weekly-callout"><span /><div><Icon name="star" size={25} /><p>New courses and lessons added every week.</p></div><span /></div><div className="bar-art" aria-hidden="true">{[38, 70, 102, 135, 87, 58, 31, 69, 92, 121, 84, 54, 112, 96, 74].map((height, index) => <i key={index} style={{ height: `${height}px` }} />)}</div></section>
  </main>;
}
