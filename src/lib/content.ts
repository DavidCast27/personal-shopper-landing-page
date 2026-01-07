import { SUPPORTED, type Lang } from './lang'
import yaml from 'js-yaml';
import fs from 'fs/promises';

type Frontmatter = Record<string, unknown>


// Common typed frontmatter shapes per collection
export interface BlogFrontmatter extends Frontmatter {
  title?: string
  description?: string
  date?: string
  image?: string
}

export interface ServiceFrontmatter extends Frontmatter {
  title?: string
  description?: string
  image?: string
  price?: string
  order?: number
}

export interface FaqFrontmatter extends Frontmatter {
  question?: string
  order?: number
}

export interface TestimonialFrontmatter extends Frontmatter {
  title?: string
  author?: string
  role?: string
  avatar?: string
  rating?: number
  order?: number
}

export interface PageContent<T extends Frontmatter = Frontmatter> {
  locale: Lang
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

const rawAbs = import.meta.glob('/content/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const rawRel = import.meta.glob('content/**/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
const rawFiles: Record<string, string> = {
  ...rawAbs,
  // normalize relative keys to start with '/'
  ...Object.fromEntries(Object.entries(rawRel).map(([k, v]) => [k.startsWith('/') ? k : `/${k}`, v])),
}

function normalizeKey(p: string): string {
  return p.replace(/\?raw$/, '')
}

let __printedDebug = false

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
  // Use suffix matching as primary strategy across environments
  const rel = path.startsWith('/') ? path.slice(1) : path
  const suffixes = [path, `/${rel}`, rel]
  for (const [k, v] of Object.entries(rawFiles)) {
    const nk = normalizeKey(k)
    if (suffixes.some((s) => nk.endsWith(s))) return v
  }
  return undefined
}

function ensureLocale(locale: string): asserts locale is Lang {
  if (!(SUPPORTED as readonly string[]).includes(locale)) throw new Error(`Unsupported locale: ${locale}`)
}

export async function getPage<T extends Frontmatter = Frontmatter>(locale: Lang, key: 'home' | 'about' | 'services' | 'testimonials' | 'faq' | 'blog' | 'contact'): Promise<PageContent<T>> {
  ensureLocale(locale)
  const path = `/content/${locale}/${key}.md`
  const raw = getRaw(path)
  if (!raw) {
    if (import.meta.env?.DEV && !__printedDebug) {
      console.warn('[content] keys sample:', Object.keys(rawFiles).slice(0, 10))
      __printedDebug = true
    }
    throw new Error(`Content not found: ${path}`)
  }
  const { frontmatter, body } = parseFrontmatter(raw)
  return { locale, path, frontmatter: frontmatter as T, body }
}

// Home frontmatter and normalized page
export interface HomeFrontmatter extends Frontmatter {
  title?: string
  description?: string
  hero_title?: string
  hero_subtitle?: string
  hero_cta_text?: string
  hero_cta_href?: string
  hero_secondary_cta_text?: string
  hero_secondary_cta_href?: string
  hero_image?: string
  hero_image_alt?: string
  services_title?: string
  services_description?: string
  services_cta_text?: string
  services_cta_href?: string
  steps_title?: string
  cta_text?: string
  cta_description?: string
  cta_link_text?: string
  cta_link_href?: string
}

export interface HomePage extends PageContent<HomeFrontmatter> {
  // normalized fields
  title: string
  description: string
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  hero_cta_href: string
  hero_secondary_cta_text?: string
  hero_secondary_cta_href?: string
  hero_image?: string
  hero_image_alt: string
  services_title?: string
  services_description?: string
  services_cta_text?: string
  services_cta_href?: string
  steps_title?: string
  cta_text?: string
  cta_description?: string
  cta_link_text?: string
  cta_link_href?: string
}

const HOME_DEFAULTS: Record<Lang, {
  title: string
  description: string
  hero_title: string
  hero_subtitle: string
  hero_cta_text: string
  hero_cta_href: string
  hero_image_alt: string
}> = {
  en: {
    title: 'Personal Shopper – EN',
    description: 'Personal shopper services in Canada',
    hero_title: 'Personal Shopper in Canada',
    hero_subtitle: 'Personal shopping and styling services in Canada.',
    hero_cta_text: 'Book a consult',
    hero_cta_href: '/en/contact',
    hero_image_alt: 'Personal Shopper',
  },
  es: {
    title: 'Personal Shopper – ES',
    description: 'Servicios de personal shopper en Canadá',
    hero_title: 'Personal Shopper en Canadá',
    hero_subtitle: 'Servicios de personal shopper en Canadá.',
    hero_cta_text: 'Reservar',
    hero_cta_href: '/es/contact',
    hero_image_alt: 'Personal Shopper',
  },
  fr: {
    title: 'Personal Shopper – FR',
    description: 'Services de personal shopper au Canada',
    hero_title: 'Personal Shopper au Canada',
    hero_subtitle: 'Services de personal shopper au Canada.',
    hero_cta_text: 'Réserver',
    hero_cta_href: '/fr/contact',
    hero_image_alt: 'Personal Shopper',
  },
}

export async function getHome(locale: Lang): Promise<HomePage> {
  const page = await getPage<HomeFrontmatter>(locale, 'home')
  const fm = page.frontmatter
  const d = HOME_DEFAULTS[locale]
  return {
    ...page,
    title: fm.title || d.title,
    description: fm.description || d.description,
    hero_title: fm.hero_title || fm.title || d.hero_title,
    hero_subtitle: fm.hero_subtitle || fm.description || d.hero_subtitle,
    hero_cta_text: fm.hero_cta_text || d.hero_cta_text,
    hero_cta_href: fm.hero_cta_href || d.hero_cta_href,
    hero_secondary_cta_text: fm.hero_secondary_cta_text || undefined,
    hero_secondary_cta_href: fm.hero_secondary_cta_href || undefined,
    hero_image: fm.hero_image || undefined,
    hero_image_alt: fm.hero_image_alt || d.hero_image_alt,
    services_title: fm.services_title || undefined,
    services_description: fm.services_description || undefined,
    services_cta_text: fm.services_cta_text || undefined,
    services_cta_href: fm.services_cta_href || undefined,
    steps_title: fm.steps_title || undefined,
    cta_text: fm.cta_text || undefined,
    cta_description: fm.cta_description || undefined,
    cta_link_text: fm.cta_link_text || undefined,
    cta_link_href: fm.cta_link_href || undefined,
  }
}

export interface BlogListItem extends PageContent<BlogFrontmatter> {
  slug: string
  // normalized fields
  title: string
  description: string
  image?: string
}

export async function getBlogPosts(locale: Lang): Promise<BlogListItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/blog/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix))
  const items = entries.map(([pathRaw, raw]) => {
    const path = normalizeKey(pathRaw)
    const { frontmatter, body } = parseFrontmatter(raw)
    const slug = path.replace(prefix, '').replace(/\.md$/, '')
    const fm = frontmatter as BlogFrontmatter
    return {
      locale,
      path,
      slug,
      frontmatter: fm,
      body,
      title: fm.title || slug,
      description: fm.description || '',
      image: fm.image || undefined,
    } as BlogListItem
  })
  items.sort((a, b) => {
    const da = new Date((a.frontmatter?.date as string) || 0).getTime()
    const db = new Date((b.frontmatter?.date as string) || 0).getTime()
    return db - da
  })
  return items
}

export async function getPost(locale: Lang, slug: string): Promise<BlogListItem> {
  ensureLocale(locale)
  const path = `/content/${locale}/blog/${slug}.md`
  const raw = getRaw(path)
  if (!raw) throw new Error(`Post not found: ${path}`)
  const { frontmatter, body } = parseFrontmatter(raw)
  const fm = frontmatter as BlogFrontmatter
  return {
    locale,
    path,
    slug,
    frontmatter: fm,
    body,
    title: fm.title || slug,
    description: fm.description || '',
    image: fm.image || undefined,
  }
}

export interface SiteSettings extends Frontmatter {
  header_cta_text?: string
  header_cta_href?: string
  footer_description?: string
  og_image?: string
  logo_text?: string
  logo_href?: string
  logo_src?: string
  logo_alt?: string
}

export async function getSiteSettings(locale: Lang): Promise<SiteSettings | undefined> {
  ensureLocale(locale)
  const path = `/content/${locale}/site.md`
  const raw = getRaw(path)
  if (!raw) return undefined
  const { frontmatter } = parseFrontmatter(raw)
  return frontmatter as SiteSettings
}

export interface ServiceItem extends PageContent<ServiceFrontmatter> {
  slug: string
  order?: number
  price?: string
  // normalized fields
  title: string
  description: string
  image?: string
}

export async function getServices(locale: Lang): Promise<ServiceItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/services/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix))
  const items = entries.map(([pathRaw, raw]) => {
    const path = normalizeKey(pathRaw)
    const { frontmatter, body } = parseFrontmatter(raw)
    const orderRaw = frontmatter.order as string | number | undefined
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const slug = path.replace(prefix, '').replace(/\.md$/, '')
    const fm = frontmatter as ServiceFrontmatter
    return {
      locale,
      path,
      slug,
      frontmatter: fm,
      body,
      order,
      price: (fm.price as string) || undefined,
      title: fm.title || slug,
      description: fm.description || '',
      image: fm.image || undefined,
    } as ServiceItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

export interface FaqItem extends PageContent<FaqFrontmatter> {
  slug: string
  order?: number
  // normalized fields
  question: string
}

export async function getFaq(locale: Lang): Promise<FaqItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/faq/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix))
  const items = entries.map(([pathRaw, raw]) => {
    const path = normalizeKey(pathRaw)
    const { frontmatter, body } = parseFrontmatter(raw)
    const orderRaw = frontmatter.order as string | number | undefined
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const slug = path.replace(prefix, '').replace(/\.md$/, '')
    const fm = frontmatter as FaqFrontmatter
    return {
      locale,
      path,
      slug,
      frontmatter: fm,
      body,
      order,
      question: fm.question || slug,
    } as FaqItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

export interface TestimonialItem extends PageContent<TestimonialFrontmatter> {
  slug: string
  order?: number
  rating?: number
  // normalized fields
  title: string
  author?: string
  role?: string
  avatar?: string
}

export async function getTestimonials(locale: Lang): Promise<TestimonialItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/testimonials/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix))
  const items = entries.map(([pathRaw, raw]) => {
    const path = normalizeKey(pathRaw)
    const { frontmatter, body } = parseFrontmatter(raw)
    const orderRaw = frontmatter.order as string | number | undefined
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const ratingRaw = frontmatter.rating as string | number | undefined
    const rating = typeof ratingRaw === 'number' ? ratingRaw : ratingRaw ? parseInt(String(ratingRaw), 10) : undefined
    const slug = path.replace(prefix, '').replace(/\.md$/, '')
    const fm = frontmatter as TestimonialFrontmatter
    return {
      locale,
      path,
      slug,
      frontmatter: fm,
      body,
      order,
      rating,
      title: fm.title || slug,
      author: (fm.author as string) || undefined,
      role: (fm.role as string) || undefined,
      avatar: (fm.avatar as string) || undefined,
    } as TestimonialItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}



// Not Found (404) content
export interface NotFoundFrontmatter extends Frontmatter {
  title?: string
  description?: string
  cta_text?: string
  cta_href?: string
}

export interface NotFoundPage extends PageContent<NotFoundFrontmatter> {
  title: string
  description: string
  cta_text: string
  cta_href: string
}

const NOT_FOUND_DEFAULTS: Record<Lang, {
  title: string
  description: string
  cta_text: string
  cta_href: string
}> = {
  en: {
    title: 'Page not found',
    description: "The page you're looking for doesn’t exist or was moved.",
    cta_text: 'Back to home',
    cta_href: '/en',
  },
  es: {
    title: 'Página no encontrada',
    description: 'La página que buscas no existe o se ha movido.',
    cta_text: 'Volver al inicio',
    cta_href: '/es',
  },
  fr: {
    title: 'Page introuvable',
    description: "La page que vous cherchez n’existe pas ou a été déplacée.",
    cta_text: 'Retour à l’accueil',
    cta_href: '/fr',
  },
}

export async function getNotFound(locale: Lang): Promise<NotFoundPage> {
  ensureLocale(locale)
  const path = `/content/${locale}/not-found.md`
  const raw = getRaw(path)
  const d = NOT_FOUND_DEFAULTS[locale]
  if (!raw) {
    return {
      locale,
      path,
      frontmatter: {},
      body: '',
      title: d.title,
      description: d.description,
      cta_text: d.cta_text,
      cta_href: d.cta_href,
    }
  }
  const { frontmatter, body } = parseFrontmatter(raw)
  const fm = frontmatter as NotFoundFrontmatter
  return {
    locale,
    path,
    frontmatter: fm,
    body,
    title: fm.title || d.title,
    description: fm.description || d.description,
    cta_text: fm.cta_text || d.cta_text,
    cta_href: fm.cta_href || d.cta_href,
  }
}

export interface HowItWorksItem extends PageContent {
  order?: number
  icon?: string
  link_text?: string
  link_href?: string
}

// Frontmatter + normalized for How It Works
export interface HowItWorksFrontmatter extends Frontmatter {
  title?: string
  description?: string
  icon?: string
  link_text?: string
  link_href?: string
  order?: number
}

export interface HowItWorksItem extends PageContent<HowItWorksFrontmatter> {
  slug: string
  order?: number
  // normalized fields
  title: string
  description: string
  icon?: string
  link_text?: string
  link_href?: string
}

export async function getHowItWorks(locale: Lang): Promise<HowItWorksItem[]> {
  ensureLocale(locale)
  const prefix = `/content/${locale}/howitworks/`
  const entries = Object.entries(rawFiles).filter(([p]) => p.startsWith(prefix))
  const items = entries.map(([pathRaw, raw]) => {
    const path = normalizeKey(pathRaw)
    const { frontmatter, body } = parseFrontmatter(raw)
    const orderRaw = frontmatter.order as string | number | undefined
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const slug = path.replace(prefix, '').replace(/\.md$/, '')
    const fm = frontmatter as HowItWorksFrontmatter
    return {
      locale,
      path,
      slug,
      frontmatter: fm,
      body,
      order,
      title: fm.title || slug,
      description: fm.description || '',
      icon: (fm.icon as string) || undefined,
      link_text: (fm.link_text as string) || undefined,
      link_href: (fm.link_href as string) || undefined,
    } as HowItWorksItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

export async function getService(locale: Lang, slug: string): Promise<ServiceItem> {
  ensureLocale(locale)
  const path = `/content/${locale}/services/${slug}.md`
  const raw = getRaw(path)
  if (!raw) throw new Error(`Service not found: ${path}`)
  const { frontmatter, body } = parseFrontmatter(raw)
  const fm = frontmatter as ServiceFrontmatter
  return {
    locale,
    path,
    slug,
    frontmatter: fm,
    body,
    order: fm.order || undefined,
    price: fm.price || undefined,
    title: fm.title || slug,
    description: fm.description || '',
    image: fm.image || undefined,
  } as ServiceItem
}

export interface NewHeaderMenuItem {
  slug: string;
  order?: number;
  parent?: string;
  text: string;
  href: string;
}

async function getYaml(path: string): Promise<any> {
  const raw = await fs.readFile(path, 'utf-8');
  return yaml.load(raw);
}

export async function getNewHeaderMenu(locale: Lang): Promise<NewHeaderMenuItem[]> {
  const data = await getYaml('content/menus/header.yml');
  const items = data.links.map((link: any) => ({
    slug: link.slug,
    order: link.order,
    parent: link.parent,
    text: link[`text_${locale}`],
    href: link[`url_${locale}`],
  }));
  items.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  return items;
}

export interface NewFooterLinkItem {
  slug: string;
  order?: number;
  section: string;
  text: string;
  href: string;
}

export async function getNewFooterLinks(locale: Lang): Promise<NewFooterLinkItem[]> {
  const data = await getYaml('content/menus/footer.yml');
  const items = data.links.map((link: any) => ({
    slug: link.slug,
    order: link.order,
    section: link.section,
    text: link[`text_${locale}`],
    href: link[`url_${locale}`],
  }));
  items.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  return items;
}

