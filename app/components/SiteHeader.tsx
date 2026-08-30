"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"

import posthog from "posthog-js"

import { Icon, VertexMark } from "./Icon"

export function SiteHeader() {
  const pathname = usePathname()
  const isCoursesActive = pathname.startsWith("/courses")
  const isLearningActive = pathname.startsWith("/my-learning")

  return (
    <header className="home-header">
      <Link className="home-brand" href="/">
        <VertexMark />
        <span>Vertex</span>
      </Link>
      <nav className="home-nav" aria-label="Main navigation">
        <Link className={isCoursesActive ? "active" : ""} href="/courses">
          Courses
        </Link>
        <Link className={isLearningActive ? "active" : ""} href="/my-learning">
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
              <button
                className="auth-button auth-button-ghost"
                onClick={() => posthog.capture("sign_in_clicked")}
              >
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                className="auth-button auth-button-primary"
                onClick={() => posthog.capture("sign_up_clicked")}
              >
                Sign up
              </button>
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
