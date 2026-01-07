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
  // Prefer centralized YAML if present
  const yamlPath = `content/pages/${key}.yml`
  try {
    const data = await getYaml(yamlPath)
    const { localized, body } = localizeYaml(data, locale)
    return {
      locale,
      path: `/${yamlPath}`,
      frontmatter: localized as T,
      body: body || '',
    }
  } catch {
    // Fallback to legacy per-locale Markdown
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
  // 1) Prefer unified YAML posts (single file with localized fields)
  const unifiedItems = await loadUnifiedBlogPosts(locale)
  if (unifiedItems.length > 0) return unifiedItems

  // 2) Fallback to legacy per-locale Markdown posts
  const prefix = `/content/blog/${locale}/`
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
  // Try unified YAML first
  const unified = await loadUnifiedBlogPost(locale, slug)
  if (unified) return unified

  // Fallback to legacy per-locale Markdown
  const path = `/content/blog/${locale}/${slug}.md`
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
  const data = await getYaml('content/settings.yml');

  return {
    logo_src: data.logo_src,
    logo_href: data.logo_href,
    og_image: data.og_image,
    logo_text: data.logo_text,
    logo_alt: data.logo_alt,
    header_cta_text: data[`header_cta_text_${locale}`],
    header_cta_href: data[`header_cta_href_${locale}`],
    footer_description: data[`footer_description_${locale}`],
  };
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
  // 1) Prefer unified YAML services
  const unified = await loadUnifiedServices(locale)
  if (unified.length > 0) return unified

  // 2) Fallback to legacy per-locale Markdown files
  const prefix = `/content/services/${locale}/`
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
  // 1) Prefer unified YAML FAQ entries
  const unified = await loadUnifiedFaq(locale)
  if (unified.length > 0) return unified

  // 2) Fallback to legacy per-locale Markdown files
  const prefix = `/content/faq/${locale}/`
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
  // 1) Prefer unified YAML testimonials
  const unified = await loadUnifiedTestimonials(locale)
  if (unified.length > 0) return unified

  // 2) Fallback to legacy per-locale Markdown files
  const prefix = `/content/testimonials/${locale}/`
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
  // Prefer centralized YAML if present
  try {
    const data = await getYaml('content/pages/not-found.yml')
    const { localized } = localizeYaml(data, locale)
    const d = NOT_FOUND_DEFAULTS[locale]
    const title = (localized.title as string) || d.title
    const description = (localized.description as string) || d.description
    const cta_text = (localized.cta_text as string) || d.cta_text
    const cta_href = (localized.cta_href as string) || d.cta_href
    return {
      locale,
      path: '/content/pages/not-found.yml',
      frontmatter: localized,
      body: '',
      title,
      description,
      cta_text,
      cta_href,
    }
  } catch {
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
  // 1) Prefer unified YAML items (single file with localized fields)
  const unified = await loadUnifiedHowItWorks(locale)
  if (unified.length > 0) return unified

  // 2) Fallback to legacy per-locale Markdown files
  const prefix = `/content/howitworks/${locale}/`
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
  // Try unified YAML first
  const unified = await loadUnifiedService(locale, slug)
  if (unified) return unified

  // Fallback to legacy per-locale Markdown
  const path = `/content/services/${locale}/${slug}.md`
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

function localizeYaml(data: any, locale: Lang): { localized: Record<string, any>; body?: string } {
  const localized: Record<string, any> = {}
  let body: string | undefined
  for (const [key, value] of Object.entries(data || {})) {
    const m = key.match(/^(.*)_(en|es|fr)$/)
    if (m) {
      const base = m[1]
      const lang = m[2]
      if (lang === locale) localized[base] = value
      if (base === 'body' && lang === locale && typeof value === 'string') body = value
    } else {
      localized[key] = value
    }
  }
  if (!body && typeof (data?.[`body_${locale}`]) === 'string') body = data[`body_${locale}`]
  return { localized, body }
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

// --- Unified Blog (single YAML per post) helpers ---
async function listYamlFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries.filter((e) => e.isFile() && e.name.endsWith('.yml')).map((e) => `${dir}/${e.name}`)
  } catch {
    return []
  }
}

async function loadUnifiedBlogPosts(locale: Lang): Promise<BlogListItem[]> {
  const files = await listYamlFiles('content/blog_entries')
  if (files.length === 0) return []
  const items: BlogListItem[] = []
  for (const file of files) {
    const data = await getYaml(file)
    const { localized, body } = localizeYaml(data, locale)
    const slug = String(data.slug || file.replace(/^.*\/(.+)\.yml$/, '$1'))
    const fm: BlogFrontmatter = {
      title: localized.title,
      description: localized.description,
      date: data.date,
      image: data.image,
    }
    items.push({
      locale,
      path: `/${file}`,
      slug,
      frontmatter: fm,
      body: body || '',
      title: fm.title || slug,
      description: fm.description || '',
      image: fm.image || undefined,
    })
  }
  items.sort((a, b) => {
    const da = new Date((a.frontmatter?.date as string) || 0).getTime()
    const db = new Date((b.frontmatter?.date as string) || 0).getTime()
    return db - da
  })
  return items
}

async function loadUnifiedBlogPost(locale: Lang, slug: string): Promise<BlogListItem | undefined> {
  const path = `content/blog_entries/${slug}.yml`
  try {
    const data = await getYaml(path)
    const { localized, body } = localizeYaml(data, locale)
    const fm: BlogFrontmatter = {
      title: localized.title,
      description: localized.description,
      date: data.date,
      image: data.image,
    }
    return {
      locale,
      path: `/${path}`,
      slug,
      frontmatter: fm,
      body: body || '',
      title: fm.title || slug,
      description: fm.description || '',
      image: fm.image || undefined,
    }
  } catch {
    return undefined
  }
}

// --- Unified How It Works (single YAML per step) helpers ---
async function loadUnifiedHowItWorks(locale: Lang): Promise<HowItWorksItem[]> {
  const files = await listYamlFiles('content/howitworks_entries')
  if (files.length === 0) return []
  const items: HowItWorksItem[] = []
  for (const file of files) {
    const data = await getYaml(file)
    const { localized, body } = localizeYaml(data, locale)
    const slug = String(data.slug || file.replace(/^.*\/(.+)\.yml$/, '$1'))
    const orderRaw = data.order
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    items.push({
      locale,
      path: `/${file}`,
      slug,
      frontmatter: {
        title: localized.title,
        description: localized.description,
        icon: data.icon,
        link_text: localized.link_text,
        link_href: localized.link_href,
        order,
      },
      body: body || '',
      order,
      title: (localized.title as string) || slug,
      description: (localized.description as string) || '',
      icon: (data.icon as string) || undefined,
      link_text: (localized.link_text as string) || undefined,
      link_href: (localized.link_href as string) || undefined,
    })
  }
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

// --- Unified Services (single YAML per service) helpers ---
async function loadUnifiedServices(locale: Lang): Promise<ServiceItem[]> {
  const files = await listYamlFiles('content/service_entries')
  if (files.length === 0) return []
  const items: ServiceItem[] = []
  for (const file of files) {
    const data = await getYaml(file)
    const { localized, body } = localizeYaml(data, locale)
    const slug = String(data.slug || file.replace(/^.*\/(.+)\.yml$/, '$1'))
    const orderRaw = data.order
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const price = (data[`price_${locale}`] as string) || (data.price as string) || undefined
    items.push({
      locale,
      path: `/${file}`,
      slug,
      frontmatter: {
        title: localized.title,
        description: localized.description,
        image: data.image,
        price,
        order,
      },
      body: body || '',
      order,
      price,
      title: (localized.title as string) || slug,
      description: (localized.description as string) || '',
      image: (data.image as string) || undefined,
    })
  }
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

async function loadUnifiedService(locale: Lang, slug: string): Promise<ServiceItem | undefined> {
  const path = `content/service_entries/${slug}.yml`
  try {
    const data = await getYaml(path)
    const { localized, body } = localizeYaml(data, locale)
    const orderRaw = data.order
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const price = (data[`price_${locale}`] as string) || (data.price as string) || undefined
    return {
      locale,
      path: `/${path}`,
      slug,
      frontmatter: {
        title: localized.title,
        description: localized.description,
        image: data.image,
        price,
        order,
      },
      body: body || '',
      order,
      price,
      title: (localized.title as string) || slug,
      description: (localized.description as string) || '',
      image: (data.image as string) || undefined,
    }
  } catch {
    return undefined
  }
}

// --- Unified Testimonials (single YAML per testimonial) helpers ---
async function loadUnifiedTestimonials(locale: Lang): Promise<TestimonialItem[]> {
  const files = await listYamlFiles('content/testimonial_entries')
  if (files.length === 0) return []
  const items: TestimonialItem[] = []
  for (const file of files) {
    const data = await getYaml(file)
    const { localized, body } = localizeYaml(data, locale)
    const slug = String(data.slug || file.replace(/^.*\/(.+)\.yml$/, '$1'))
    const orderRaw = data.order
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const ratingRaw = data.rating
    const rating = typeof ratingRaw === 'number' ? ratingRaw : ratingRaw ? parseInt(String(ratingRaw), 10) : undefined
    items.push({
      locale,
      path: `/${file}`,
      slug,
      frontmatter: {
        title: localized.title,
        author: data.author,
        role: localized.role,
        avatar: data.avatar,
        rating,
        order,
      },
      body: body || '',
      order,
      rating,
      title: (localized.title as string) || slug,
      author: (data.author as string) || undefined,
      role: (localized.role as string) || undefined,
      avatar: (data.avatar as string) || undefined,
    })
  }
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

// --- Unified FAQ (single YAML per question) helpers ---
async function loadUnifiedFaq(locale: Lang): Promise<FaqItem[]> {
  const files = await listYamlFiles('content/faq_entries')
  if (files.length === 0) return []
  const items: FaqItem[] = []
  for (const file of files) {
    const data = await getYaml(file)
    const { localized, body } = localizeYaml(data, locale)
    const slug = String(data.slug || file.replace(/^.*\/(.+)\.yml$/, '$1'))
    const orderRaw = data.order
    const order = typeof orderRaw === 'number' ? orderRaw : orderRaw ? parseInt(String(orderRaw), 10) : undefined
    const question = (localized.question as string) || slug
    items.push({
      locale,
      path: `/${file}`,
      slug,
      frontmatter: {
        question,
        order,
      },
      body: body || '',
      order,
      question,
    })
  }
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}
