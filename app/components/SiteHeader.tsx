import Link from "next/link"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

import { Icon, VertexMark } from "./Icon"

type SiteHeaderProps = {
  activeNav?: "courses" | "learning"
}

export function SiteHeader({ activeNav = "courses" }: SiteHeaderProps) {
  return (
    <header className="home-header">
      <Link className="home-brand" href="/">
        <VertexMark />
        <span>Vertex</span>
      </Link>
      <nav className="home-nav" aria-label="Main navigation">
        <Link className={activeNav === "courses" ? "active" : ""} href="/#courses">
          Courses
        </Link>
        <Link className={activeNav === "learning" ? "active" : ""} href="/#learning">
          My Learning
        </Link>
      </nav>
      <div className="home-actions">
        <button className="icon-button" aria-label="Notifications">
          <Icon name="bell" size={24} />
        </button>
        <Show when="signed-out">
          <div className="auth-actions">
            <SignInButton mode="modal">
              <button className="auth-button auth-button-ghost">Sign in</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="auth-button auth-button-primary">Sign up</button>
            </SignUpButton>
          </div>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  )
}
