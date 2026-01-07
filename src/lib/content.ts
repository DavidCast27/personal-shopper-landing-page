import { SUPPORTED, type Lang } from './lang'
import { getCollection, getEntry } from 'astro:content'

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

let __printedDebug = false

function ensureLocale(locale: string): asserts locale is Lang {
  if (!(SUPPORTED as readonly string[]).includes(locale)) throw new Error(`Unsupported locale: ${locale}`)
}

export async function getPage<T extends Frontmatter = Frontmatter>(locale: Lang, key: 'home' | 'about' | 'services' | 'testimonials' | 'faq' | 'blog' | 'contact'): Promise<PageContent<T>> {
  ensureLocale(locale)
  // Prefer centralized pages via Content Collections
  const entry = await getEntry('pages', key)
  if (entry) {
    const data: any = entry.data
    const { localized, body } = localizeYaml(data, locale)
    return {
      locale,
      path: (entry as any).id,
      frontmatter: localized as T,
      body: body || '',
    }
  }
  throw new Error(`Content not found: pages/${key}.yml`)
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
  const posts = await getCollection('blog_entries')
  const items = posts.map((entry) => {
    const data: any = entry.data
    const slug = data.slug as string
    const title = data[`title_${locale}`] as string | undefined
    const description = (data[`description_${locale}`] as string | undefined) || ''
    const body = (data[`body_${locale}`] as string | undefined) || ''
    const image = (data.image as string | undefined) || undefined
    const date = data.date as Date | string | undefined
    const fm: BlogFrontmatter = { title, description, date: date ? String(date) : undefined, image }
    return {
      locale,
      path: (entry as any).id,
      slug,
      frontmatter: fm,
      body,
      title: title || slug,
      description,
      image,
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
  const entry = await getEntry('blog_entries', slug)
  if (entry) {
    const data: any = entry.data
    const title = data[`title_${locale}`] as string | undefined
    const description = (data[`description_${locale}`] as string | undefined) || ''
    const body = (data[`body_${locale}`] as string | undefined) || ''
    const image = (data.image as string | undefined) || undefined
    const date = data.date as Date | string | undefined
    const fm: BlogFrontmatter = { title, description, date: date ? String(date) : undefined, image }
    return {
      locale,
      path: (entry as any).id,
      slug,
      frontmatter: fm,
      body,
      title: title || slug,
      description,
      image,
    }
  }
  throw new Error(`Post not found: blog_entries/${slug}.yml`)
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
  const entry = await getEntry('settings', 'settings')
  if (!entry) return undefined
  const data: any = entry.data
  return {
    logo_src: data.logo_src,
    logo_href: data.logo_href,
    og_image: data.og_image,
    logo_text: data.logo_text,
    logo_alt: data.logo_alt,
    header_cta_text: data[`header_cta_text_${locale}`],
    header_cta_href: data[`header_cta_href_${locale}`],
    footer_description: data[`footer_description_${locale}`],
  }
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
  const services = await getCollection('service_entries')
  const items = services.map((entry) => {
    const data: any = entry.data
    const slug = data.slug as string
    const order = (data.order as number | undefined) ?? undefined
    const price = (data[`price_${locale}`] as string | undefined) || (data.price as string | undefined) || undefined
    const title = data[`title_${locale}`] as string | undefined
    const description = (data[`description_${locale}`] as string | undefined) || ''
    const body = (data[`body_${locale}`] as string | undefined) || ''
    const image = (data.image as string | undefined) || undefined
    return {
      locale,
      path: (entry as any).id,
      slug,
      frontmatter: {
        title,
        description,
        image,
        price,
        order,
      },
      body,
      order,
      price,
      title: title || slug,
      description,
      image,
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
  const entries = await getCollection('faq_entries')
  const items = entries.map((entry) => {
    const data: any = entry.data
    const slug = data.slug as string
    const order = (data.order as number | undefined) ?? undefined
    const question = (data[`question_${locale}`] as string | undefined) || slug
    const body = (data[`body_${locale}`] as string | undefined) || ''
    return {
      locale,
      path: (entry as any).id,
      slug,
      frontmatter: { question, order },
      body,
      order,
      question,
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
  const entries = await getCollection('testimonial_entries')
  const items = entries.map((entry) => {
    const data: any = entry.data
    const slug = data.slug as string
    const order = (data.order as number | undefined) ?? undefined
    const rating = (data.rating as number | undefined) ?? undefined
    const title = (data[`title_${locale}`] as string | undefined) || slug
    const author = (data.author as string | undefined) || undefined
    const role = (data[`role_${locale}`] as string | undefined) || undefined
    const avatar = (data.avatar as string | undefined) || undefined
    const body = (data[`body_${locale}`] as string | undefined) || ''
    return {
      locale,
      path: (entry as any).id,
      slug,
      frontmatter: { title, author, role, avatar, rating, order },
      body,
      order,
      rating,
      title,
      author,
      role,
      avatar,
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
  // Prefer centralized page via Content Collections
  const entry = await getEntry('pages', 'not-found')
  if (entry) {
    const data: any = entry.data
    const { localized } = localizeYaml(data, locale)
    const d = NOT_FOUND_DEFAULTS[locale]
    const title = (localized.title as string) || d.title
    const description = (localized.description as string) || d.description
    const cta_text = (localized.cta_text as string) || d.cta_text
    const cta_href = (localized.cta_href as string) || d.cta_href
    return {
      locale,
      path: (entry as any).id,
      frontmatter: localized,
      body: '',
      title,
      description,
      cta_text,
      cta_href,
    }
  }
  const d = NOT_FOUND_DEFAULTS[locale]
  return {
    locale,
    path: 'pages/not-found',
    frontmatter: {},
    body: '',
    title: d.title,
    description: d.description,
    cta_text: d.cta_text,
    cta_href: d.cta_href,
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
  const entries = await getCollection('howitworks_entries')
  const items = entries.map((entry) => {
    const data: any = entry.data
    const slug = data.slug as string
    const order = (data.order as number | undefined) ?? undefined
    const title = (data[`title_${locale}`] as string | undefined) || slug
    const description = (data[`description_${locale}`] as string | undefined) || ''
    const icon = (data.icon as string | undefined) || undefined
    const link_text = (data[`link_text_${locale}`] as string | undefined) || undefined
    const link_href = (data[`link_href_${locale}`] as string | undefined) || undefined
    return {
      locale,
      path: (entry as any).id,
      slug,
      frontmatter: { title, description, icon, link_text, link_href, order },
      body: '',
      order,
      title,
      description,
      icon,
      link_text,
      link_href,
    } as HowItWorksItem
  })
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

export async function getService(locale: Lang, slug: string): Promise<ServiceItem> {
  ensureLocale(locale)
  const entry = await getEntry('service_entries', slug)
  if (!entry) throw new Error(`Service not found: service_entries/${slug}.yml`)
  const data: any = entry.data
  const order = (data.order as number | undefined) ?? undefined
  const price = (data[`price_${locale}`] as string | undefined) || (data.price as string | undefined) || undefined
  const title = (data[`title_${locale}`] as string | undefined) || slug
  const description = (data[`description_${locale}`] as string | undefined) || ''
  const body = (data[`body_${locale}`] as string | undefined) || ''
  const image = (data.image as string | undefined) || undefined
  return {
    locale,
    path: (entry as any).id,
    slug,
    frontmatter: { title, description, image, price, order },
    body,
    order,
    price,
    title,
    description,
    image,
  } as ServiceItem
}

export interface NewHeaderMenuItem {
  slug: string;
  order?: number;
  parent?: string;
  text: string;
  href: string;
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
  const entry = await getEntry('menus', 'header')
  const data: any = entry?.data
  // Build a set of known service slugs to auto-generate URLs
  const services = await getCollection('service_entries')
  const serviceSlugs = new Set(services.map((s: any) => s.data?.slug))
  const topLevelKnown = new Set(['about', 'services', 'blog', 'testimonials', 'faq', 'contact'])

  const items = (data?.links || []).map((link: any) => {
    const maybeServiceSlug = link.slug?.endsWith('-sub') ? link.slug.slice(0, -4) : link.slug
    const isServiceChild = link.parent === 'services' && serviceSlugs.has(maybeServiceSlug)
    const isTopLevelKnown = !link.parent && topLevelKnown.has(link.slug)
    const href = isServiceChild
      ? `/${locale}/services/${maybeServiceSlug}`
      : isTopLevelKnown
        ? `/${locale}/${link.slug}`
        : link[`url_${locale}`]
    return {
      slug: link.slug,
      order: link.order,
      parent: link.parent,
      text: link[`text_${locale}`],
      href,
    }
  })
  items.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

export interface NewFooterLinkItem {
  slug: string;
  order?: number;
  section: string;
  text: string;
  href: string;
}

export async function getNewFooterLinks(locale: Lang): Promise<NewFooterLinkItem[]> {
  const entry = await getEntry('menus', 'footer')
  const data: any = entry?.data
  const items = (data?.links || []).map((link: any) => ({
    slug: link.slug,
    order: link.order,
    section: link.section,
    text: link[`text_${locale}`],
    href: link[`url_${locale}`],
  }))
  items.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0))
  return items
}

// Helpers removed: legacy file-system loaders are no longer needed.
