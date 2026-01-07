import type { APIRoute } from 'astro'

const SUPPORTED = ['en', 'es', 'fr'] as const
type Supported = (typeof SUPPORTED)[number]

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {}
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.split('=')
    if (!k || v === undefined) return acc
    acc[k.trim()] = decodeURIComponent(v.trim())
    return acc
  }, {})
}

function normalizeLang(code: string | null | undefined): Supported | null {
  if (!code) return null
  const lower = code.toLowerCase()
  // Map full tags like en-US -> en
  const base = lower.split('-')[0]
  return (SUPPORTED as readonly string[]).includes(base) ? (base as Supported) : null
}

function fromAcceptLanguage(header: string | null): Supported {
  if (!header) return 'en'
  // Simple parser: split by comma, consider order/quality (q) roughly
  const parts = header.split(',').map((s) => s.trim())
  // Sort by q if present (e.g., fr-CA;q=0.9)
  const scored = parts
    .map((p) => {
      const [tag, q] = p.split(';')
      const weight = q?.startsWith('q=') ? Number(q.slice(2)) || 1 : 1
      return { tag: tag || '', q: weight }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of scored) {
    const candidate = normalizeLang(tag)
    if (candidate) return candidate
  }
  return 'en'
}

export const GET: APIRoute = async ({ request }) => {
  const cookies = parseCookies(request.headers.get('cookie'))
  const cookieLang = normalizeLang(cookies['lang'])
  const picked: Supported = cookieLang ?? fromAcceptLanguage(request.headers.get('accept-language'))

  const location = `/${picked}/`
  const headers = new Headers({
    Location: location,
    Vary: 'Accept-Language, Cookie',
  })

  if (!cookieLang) {
    headers.append(
      'Set-Cookie',
      `lang=${picked}; Path=/; Max-Age=31536000; SameSite=Lax`
    )
  }

  return new Response(null, { status: 302, headers })
}
