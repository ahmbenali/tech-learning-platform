"use client"

import { useState } from "react"
import { PortableText, type PortableTextBlock } from "next-sanity"

import { Icon, type IconName } from "@/app/components/Icon"

type Resource = {
  _key: string
  type: "article" | "code" | "download" | "link"
  title: string
  description: string
  url: string
}

type Props = {
  notes: PortableTextBlock[]
  keyPoints: string[]
  proTip?: string
  resources: Resource[]
}

const RESOURCE_ICON: Record<Resource["type"], IconName> = {
  article: "file",
  code: "code",
  download: "bookmark",
  link: "arrow",
}

export function LessonTabs({ notes, keyPoints, proTip, resources }: Props) {
  const [tab, setTab] = useState<"content" | "notes">("content")

  return (
    <div className="lesson-tabs-wrap">
      <div className="lesson-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={tab === "content"}
          className={`lesson-tab${tab === "content" ? " lesson-tab--active" : ""}`}
          onClick={() => setTab("content")}
        >
          Course Content
        </button>
        <button
          role="tab"
          aria-selected={tab === "notes"}
          className={`lesson-tab${tab === "notes" ? " lesson-tab--active" : ""}`}
          onClick={() => setTab("notes")}
        >
          Notes
        </button>
      </div>

      <div role="tabpanel" hidden={tab !== "content"} className="lesson-tab-panel">
        <section className="lesson-overview">
          <h2>Overview</h2>
          {keyPoints.length > 0 && (
            <>
              <p className="lesson-overview-intro">In this lesson you will:</p>
              <ul className="lesson-key-points">
                {keyPoints.map((point, i) => (
                  <li key={i}>
                    <Icon name="check" size={16} />
                    {point}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {proTip && (
          <div className="lesson-pro-tip">
            <span className="lesson-pro-tip-label">Pro Tip</span>
            <p>{proTip}</p>
          </div>
        )}

        {resources.length > 0 && (
          <section className="lesson-resources">
            <h2>Resources</h2>
            <div className="lesson-resources-grid">
              {resources.map((resource) => (
                <div key={resource._key} className="lesson-resource-card">
                  <Icon name={RESOURCE_ICON[resource.type] ?? "file"} size={20} />
                  <div>
                    <p className="lesson-resource-title">{resource.title}</p>
                    <p className="lesson-resource-desc">{resource.description}</p>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lesson-resource-link"
                    >
                      Open resource <Icon name="arrow" size={14} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <div role="tabpanel" hidden={tab !== "notes"} className="lesson-tab-panel lesson-notes">
        <PortableText value={notes} />
      </div>
    </div>
  )
}
