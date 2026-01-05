import type { APIRoute } from 'astro'

const SITE_URL = process.env.SITE_URL

export const GET: APIRoute = ({ request }) => {
  const origin = SITE_URL || new URL(request.url).origin
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap-index.xml`,
    `Sitemap: ${origin}/sitemap.xml`,
  ]
  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

