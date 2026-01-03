type Locale = 'en' | 'es' | 'fr'

type Frontmatter = Record<string, unknown>

export interface PageContent<T extends Frontmatter = Frontmatter> {
  locale: Locale
  path: string
  slug?: string
  frontmatter: T & {
    title?: string
    description?: string
    date?: string
    image?: string
  }
  body: string
}

const rawFiles = import.meta.glob('/content/**/*.md', { as: 'raw', eager: true }) as Record<string, string>

function parseFrontmatter(raw: string): { frontmatter: Frontmatter; body: string } {
  if (!raw.startsWith('---')) return { frontmatter: {}, body: raw }
  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { frontmatter: {}, body: raw }
  const fmBlock = raw.slice(3, end).trim()
  const body = raw.slice(end + 4).replace(/^\s+/, '')

  const lines = fmBlock.split(/\r?\n/)
  const fm: Frontmatter = {}
  for (const line of lines) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    let value: unknown = m[2]?.trim()
    if (typeof value === 'string') {
      value = value.replace(/^['"]|['"]$/g, '')
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
        // likely date
        fm[key] = value
        continue
      }
      if (value === 'true') value = true
      else if (value === 'false') value = false
    }
    fm[key] = value
  }
  return { frontmatter: fm, body }
}

function getRaw(path: string): string | undefined {
  return rawFiles[path]
}

function ensureLocale(locale: string): asserts locale is Locale {
  if (!['en', 'es', 'fr'].includes(locale)) throw new Error(`Unsupported locale: ${locale}`)
}

export async function getPage<T extends Frontmatter = Frontmatter>(locale: Locale, key: 'home' | 'about' | 'services' | 'testimonials' | 'faq'): Promise<PageContent<T>> {
  ensureLocale(locale)
  const path = `/content/${locale}/${key}.md`
  const raw = getRaw(path)
  if (!raw) throw new Error(`Content not found: ${path}`)
  const { frontmatter, body } = parseFrontmatter(raw)
  return { locale, path, frontmatter: frontmatter as T, body }
}

export async function getHome<T extends Frontmatter = Frontmatter>(locale: Locale) {
  return getPage<T>(locale, 'home')
}

export interface BlogListItem extends PageContent {
  slug: string
}

export async function getBlogPosts(locale: Locale): Promise<BlogListItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/blog/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix) && p.endsWith('.md'))
  const items = entries.map(([path, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw)
    const slug = path.replace(prefix, '').replace(/\.md$/, '')
    return { locale, path, slug, frontmatter: frontmatter as Frontmatter, body } as BlogListItem
  })
  items.sort((a, b) => {
    const da = new Date((a.frontmatter?.date as string) || 0).getTime()
    const db = new Date((b.frontmatter?.date as string) || 0).getTime()
    return db - da
  })
  return items
}

export async function getPost(locale: Locale, slug: string): Promise<BlogListItem> {
  ensureLocale(locale)
  const path = `/content/${locale}/blog/${slug}.md`
  const raw = getRaw(path)
  if (!raw) throw new Error(`Post not found: ${path}`)
  const { frontmatter, body } = parseFrontmatter(raw)
  return { locale, path, slug, frontmatter: frontmatter as Frontmatter, body }
}

export interface SiteSettings extends Frontmatter {
  header_cta_text?: string
  header_cta_href?: string
  footer_description?: string
}

export async function getSiteSettings(locale: Locale): Promise<SiteSettings | undefined> {
  ensureLocale(locale)
  const path = `/content/${locale}/site.md`
  const raw = getRaw(path)
  if (!raw) return undefined
  const { frontmatter } = parseFrontmatter(raw)
  return frontmatter as SiteSettings
}

export interface ServiceItem extends PageContent {
  order?: number
  price?: string
}

export async function getServices(locale: Locale): Promise<ServiceItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/services/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix) && p.endsWith('.md'))
  const items = entries.map(([path, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw)
    const orderRaw = frontmatter.order as string | number | undefined
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    return {
      locale,
      path,
      slug: path.replace(prefix, '').replace(/\.md$/, ''),
      frontmatter: frontmatter as Frontmatter,
      body,
      order,
      price: (frontmatter.price as string) || undefined,
    } as ServiceItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

export interface FaqItem extends PageContent {
  order?: number
}

export async function getFaq(locale: Locale): Promise<FaqItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/faq/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix) && p.endsWith('.md'))
  const items = entries.map(([path, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw)
    const orderRaw = frontmatter.order as string | number | undefined
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    return {
      locale,
      path,
      slug: path.replace(prefix, '').replace(/\.md$/, ''),
      frontmatter: frontmatter as Frontmatter,
      body,
      order,
    } as FaqItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

export interface TestimonialItem extends PageContent {
  order?: number
  rating?: number
}

export async function getTestimonials(locale: Locale): Promise<TestimonialItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/testimonials/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix) && p.endsWith('.md'))
  const items = entries.map(([path, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw)
    const orderRaw = frontmatter.order as string | number | undefined
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const ratingRaw = frontmatter.rating as string | number | undefined
    const rating = typeof ratingRaw === 'number' ? ratingRaw : ratingRaw ? parseInt(String(ratingRaw), 10) : undefined
    return {
      locale,
      path,
      slug: path.replace(prefix, '').replace(/\.md$/, ''),
      frontmatter: frontmatter as Frontmatter,
      body,
      order,
      rating,
    } as TestimonialItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

export interface NavItem extends PageContent {
  order?: number
}

export async function getHeaderMenu(locale: Locale): Promise<NavItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/nav/header/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix) && p.endsWith('.md'))
  const items = entries.map(([path, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw)
    const orderRaw = frontmatter.order as string | number | undefined
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    return {
      locale,
      path,
      slug: path.replace(prefix, '').replace(/\.md$/, ''),
      frontmatter: frontmatter as Frontmatter,
      body,
      order,
    } as NavItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

export interface FooterLinkItem extends PageContent {
  order?: number
  section?: string
}

export async function getFooterLinks(locale: Locale): Promise<FooterLinkItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/footer/links/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix) && p.endsWith('.md'))
  const items = entries.map(([path, raw]) => {
    const { frontmatter, body } = parseFrontmatter(raw)
    const orderRaw = frontmatter.order as string | number | undefined
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const section = (frontmatter.section as string) || 'Links'
    return {
      locale,
      path,
      slug: path.replace(prefix, '').replace(/\.md$/, ''),
      frontmatter: frontmatter as Frontmatter,
      body,
      order,
      section,
    } as FooterLinkItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}
