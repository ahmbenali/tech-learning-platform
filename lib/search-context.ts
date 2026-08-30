import 'server-only'

let cachedContext: string | null = null

export async function getInitialContext(): Promise<string> {
  if (cachedContext) return cachedContext

  const base = process.env.SANITY_CONTEXT_MCP_URL
  if (!base) throw new Error('Missing SANITY_CONTEXT_MCP_URL')

  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) throw new Error('Missing SANITY_API_READ_TOKEN')

  // Append /initial-context before any query string
  const [path, qs] = base.split('?')
  const url = qs
    ? `${path.replace(/\/$/, '')}/initial-context?${qs}`
    : `${path.replace(/\/$/, '')}/initial-context`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new Error(`Sanity Context MCP returned ${res.status}: ${await res.text()}`)
  }

  const data = await res.text()
  cachedContext = data
  return cachedContext
}
