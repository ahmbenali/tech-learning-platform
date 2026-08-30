"use client";

import { useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import posthog from "posthog-js";

/**
 * Identifies the signed-in Clerk user with PostHog and resets on sign-out.
 * Renders nothing — mount this once in the root layout.
 */
export function PostHogUserIdentifier() {
  const { user, isLoaded, isSignedIn } = useUser();
  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      wasSignedIn.current = true;
      posthog.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        username: user.username,
      });
    } else if (!isSignedIn && wasSignedIn.current) {
      // Transition from signed-in → signed-out: reset to clear the identified session
      posthog.reset();
      wasSignedIn.current = false;
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
