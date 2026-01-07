import { defineCollection, z } from 'astro:content'

// Helpers
const localized = (name: string, required = true) => ({
  [`${name}_en`]: (required ? z.string() : z.string().optional()),
  [`${name}_es`]: (required ? z.string() : z.string().optional()),
  [`${name}_fr`]: (required ? z.string() : z.string().optional()),
}) as const

// Blog entries
const blog_entries = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    // Accept string or Date and normalize to Date
    date: z.union([z.string(), z.date()]).transform((v) => (v instanceof Date ? v : new Date(v))),
    image: z.string().optional().nullable(),
    ...localized('title'),
    ...localized('description', false),
    ...localized('body', false),
  }),
})

// Service entries
const service_entries = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    order: z.number().optional(),
    image: z.string().optional().nullable(),
    price: z.string().optional(),
    price_es: z.string().optional(),
    price_fr: z.string().optional(),
    ...localized('title'),
    ...localized('description', false),
    ...localized('body', false),
  }),
})

// How it works entries
const howitworks_entries = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    order: z.number().optional(),
    icon: z.string().optional(),
    ...localized('title'),
    ...localized('description'),
    ...localized('link_text', false),
    ...localized('link_href', false),
  }),
})

// Testimonial entries
const testimonial_entries = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    order: z.number().optional(),
    rating: z.number().optional(),
    author: z.string(),
    avatar: z.string().optional(),
    ...localized('role', false),
    ...localized('title'),
    ...localized('body', false),
  }),
})

// FAQ entries
const faq_entries = defineCollection({
  type: 'data',
  schema: z.object({
    slug: z.string(),
    order: z.number().optional(),
    ...localized('question'),
    ...localized('body', false),
  }),
})

// Menus (header/footer). Use flexible link shape to support both.
const menus = defineCollection({
  type: 'data',
  schema: z.object({
    links: z.array(z.object({
      slug: z.string(),
      order: z.number().optional(),
      parent: z.string().optional(),
      section: z.string().optional(),
      ...localized('text'),
      ...localized('url'),
    })),
  }),
})

// Pages (centralized). Many optional localized fields; keep schema permissive.
const pages = defineCollection({
  type: 'data',
  schema: z.object({
    // Global
    hero_image: z.string().optional(),
    logo_src: z.string().optional(),
    // Common localized
    ...localized('title'),
    ...localized('description', false),
    ...localized('body', false),
    // Home page
    ...localized('hero_title', false),
    ...localized('hero_subtitle', false),
    ...localized('hero_cta_text', false),
    ...localized('hero_cta_href', false),
    ...localized('hero_secondary_cta_text', false),
    ...localized('hero_secondary_cta_href', false),
    ...localized('hero_image_alt', false),
    ...localized('services_title', false),
    ...localized('services_description', false),
    ...localized('services_cta_text', false),
    ...localized('services_cta_href', false),
    ...localized('steps_title', false),
    ...localized('cta_text', false),
    ...localized('cta_description', false),
    ...localized('cta_link_text', false),
    ...localized('cta_link_href', false),
    // Contact page
    ...localized('name_label', false),
    ...localized('name_placeholder', false),
    ...localized('email_label', false),
    ...localized('email_placeholder', false),
    ...localized('message_label', false),
    ...localized('message_placeholder', false),
    ...localized('form_helper', false),
    ...localized('submit_text', false),
    ...localized('messages_sending', false),
    ...localized('messages_success', false),
    ...localized('messages_generic_error', false),
    ...localized('messages_network_error', false),
    ...localized('messages_rate_limit', false),
    ...localized('messages_check_fields', false),
    ...localized('messages_name_length', false),
    ...localized('messages_email_invalid', false),
    ...localized('messages_message_length', false),
    // Not found page
    ...localized('cta_href', false),
  }).strict(),
})

// Global settings
const settings = defineCollection({
  type: 'data',
  schema: z.object({
    logo_src: z.string().optional(),
    logo_href: z.string().optional(),
    og_image: z.string().optional(),
    logo_text: z.string().optional(),
    logo_alt: z.string().optional(),
    ...localized('header_cta_text', false),
    ...localized('header_cta_href', false),
    ...localized('footer_description', false),
  }),
})

export const collections = {
  blog_entries,
  service_entries,
  howitworks_entries,
  testimonial_entries,
  faq_entries,
  menus,
  pages,
  settings,
}
