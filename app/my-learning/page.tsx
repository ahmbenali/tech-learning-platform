import { PageViewTracker } from "@/app/components/PageViewTracker"
import { SiteHeader } from "@/app/components/SiteHeader"

export default function MyLearningPage() {
  return (
    <main className="home-page">
      <PageViewTracker eventName="my_learning_viewed" />
      <SiteHeader />
      <section style={{ padding: "2rem" }}>
        <h1>My Learning</h1>
      </section>
    </main>
  )
}
