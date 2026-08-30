"use client";

import posthog from "posthog-js";

import { Icon } from "./Icon";

/**
 * The "Explore Courses" call-to-action button on the home page hero.
 * Tracks a PostHog event when clicked.
 */
export function ExploreButton() {
  const handleClick = () => {
    posthog.capture("explore_courses_clicked");
  };

  return (
    <a className="explore-button" href="#courses" onClick={handleClick}>
      Explore Courses <Icon name="arrow" size={24} />
    </a>
  );
}
