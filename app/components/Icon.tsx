import type { SVGProps } from "react"

export type IconName =
  | "bell"
  | "search"
  | "arrow"
  | "chart"
  | "clock"
  | "file"
  | "star"
  | "bookmark"
  | "chevron-down"
  | "sparkles"
  | "layers"
  | "rocket"
  | "target"
  | "gauge"
  | "code"
  | "workflow"
  | "puzzle"
  | "shield"
  | "check"
  | "play"

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number
}

export function Icon({ name, size = 22, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      {shapes[name]}
    </svg>
  )
}

const shapes: Record<IconName, React.ReactNode> = {
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </>
  ),
  arrow: (
    <>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  chart: (
    <>
      <path d="M5 20V12M12 20V7M19 20V4" />
      <path d="M3 20h18" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h4M9 13h6M9 17h6" />
    </>
  ),
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />,
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  sparkles: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6 6 2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 18 9 5 9-5" />
    </>
  ),
  rocket: (
    <>
      <path d="M14 15a4 4 0 0 1-4 4l-1-2 1-3" />
      <path d="M9 10a4 4 0 0 1 4-4l3-1-2 4" />
      <path d="M14 6a6 6 0 0 1 4 4l-8 8-4-4 8-8Z" />
      <path d="M5 15c-1 1-1 4-1 4s3 0 4-1" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  gauge: (
    <>
      <path d="M12 21a9 9 0 1 0-9-9" />
      <path d="M12 12l4-3" />
    </>
  ),
  code: (
    <>
      <path d="m8 8-4 4 4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m14 5-4 14" />
    </>
  ),
  workflow: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="15" width="6" height="6" rx="1" />
      <path d="M9 6h6a3 3 0 0 1 3 3v6" />
    </>
  ),
  puzzle: (
    <path d="M10 3h4v3a2 2 0 1 0 0 4v4h3a2 2 0 1 1 0 4h-3v3H10v-3H7a2 2 0 1 1 0-4h3v-4a2 2 0 1 0 0-4V3Z" />
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  check: <path d="m5 12 4 4 10-10" />,
  play: <path d="M8 5v14l11-7z" />,
}

export function VertexMark() {
  return (
    <span className="home-vertex-mark" aria-hidden="true">
      <svg viewBox="0 0 32 28" fill="none">
        <path d="M2 2h28L16 27 2 2Z" fill="currentColor" />
        <path d="m10 7 6 11 6-11h-5l-1 3-1-3h-5Z" fill="white" />
      </svg>
    </span>
  )
}
