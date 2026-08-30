export function formatDuration(
  seconds: number | null | undefined,
  style: "long" | "short" = "long",
): string {
  if (!seconds || seconds <= 0) return style === "short" ? "—" : "— min"

  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

const LEVEL_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
}

export function formatLevel(value: string | null | undefined): string {
  if (!value) return ""
  return LEVEL_LABEL[value] ?? value
}

const studentFormatter = new Intl.NumberFormat("en-US")

export function formatStudentCount(count: number | null | undefined): string {
  if (!count || count <= 0) return "0 students"
  return `${studentFormatter.format(count)} students`
}
