"use client";

import { useEffect } from "react";
import Link from "next/link";
import posthog from "posthog-js";

import { Icon } from "@/app/components/Icon";

interface CourseActionsProps {
  courseSlug: string;
  courseTitle: string;
  continueHref: string;
}

/**
 * Fires course_viewed on mount and provides tracked Continue Learning / Bookmark buttons.
 */
export function CourseActions({
  courseSlug,
  courseTitle,
  continueHref,
}: CourseActionsProps) {
  useEffect(() => {
    posthog.capture("course_viewed", {
      course_slug: courseSlug,
      course_title: courseTitle,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

  const handleContinueLearning = () => {
    posthog.capture("continue_learning_clicked", {
      course_slug: courseSlug,
      course_title: courseTitle,
      lesson_href: continueHref,
    });
  };

  const handleBookmark = () => {
    posthog.capture("course_bookmarked", {
      course_slug: courseSlug,
      course_title: courseTitle,
    });
  };

  return (
    <div className="course-actions">
      <Link
        className="primary-action"
        href={continueHref}
        onClick={handleContinueLearning}
      >
        Continue Learning
        <Icon name="arrow" size={20} />
      </Link>
      <button
        className="secondary-action"
        type="button"
        onClick={handleBookmark}
      >
        <Icon name="bookmark" size={18} />
        Bookmark
      </button>
    </div>
  );
}

interface LessonLinkProps {
  courseSlug: string;
  lessonSlug: string;
  moduleIndex: number | string;
  lessonIndex: number | string;
  lessonTitle: string;
  lessonHref: string;
  durationFormatted?: string;
  isFreePreview?: boolean;
}

/**
 * A tracked lesson link for the course content section.
 */
export function LessonLink({
  courseSlug,
  lessonSlug,
  moduleIndex,
  lessonIndex,
  lessonTitle,
  lessonHref,
  durationFormatted,
  isFreePreview,
}: LessonLinkProps) {
  const handleClick = () => {
    posthog.capture("lesson_clicked", {
      course_slug: courseSlug,
      lesson_slug: lessonSlug,
      module_index: moduleIndex,
      lesson_index: lessonIndex,
      is_free_preview: isFreePreview ?? false,
    });
  };

  return (
    <Link className="lesson-row" href={lessonHref} onClick={handleClick}>
      <span className="lesson-index">
        {moduleIndex}.{lessonIndex}
      </span>
      <span className="lesson-title">{lessonTitle}</span>
      {isFreePreview ? <span className="free-badge">Free preview</span> : null}
      {durationFormatted ? (
        <span className="lesson-duration">{durationFormatted}</span>
      ) : null}
    </Link>
  );
}

interface StickyBarProps {
  courseSlug: string;
  courseTitle: string;
  continueHref: string;
  progressPercent?: number;
}

/**
 * Tracked sticky bar with a Continue Learning link.
 */
export function StickyBar({
  courseSlug,
  courseTitle,
  continueHref,
  progressPercent = 40,
}: StickyBarProps) {
  const handleClick = () => {
    posthog.capture("continue_learning_clicked", {
      course_slug: courseSlug,
      course_title: courseTitle,
      lesson_href: continueHref,
      source: "sticky_bar",
    });
  };

  return (
    <div className="course-sticky-bar" role="complementary">
      <div className="sticky-progress">
        <div className="progress-track-lg" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="progress-label">
          <strong>{progressPercent}%</strong> complete
        </span>
      </div>
      <Link className="primary-action" href={continueHref} onClick={handleClick}>
        Continue Learning
        <Icon name="arrow" size={20} />
      </Link>
    </div>
  );
}
