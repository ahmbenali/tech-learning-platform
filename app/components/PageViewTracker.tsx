"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

interface PageViewTrackerProps {
  eventName: string;
  properties?: Record<string, unknown>;
}

/**
 * Fires a single PostHog event when the page first mounts.
 * Use this for pages that represent the top of a conversion funnel.
 * Renders nothing.
 */
export function PageViewTracker({ eventName, properties }: PageViewTrackerProps) {
  useEffect(() => {
    posthog.capture(eventName, properties);
    // We intentionally omit `properties` from deps to fire once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventName]);

  return null;
}
