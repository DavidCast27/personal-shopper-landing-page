# Landing Page (Astro + Decap CMS)

Multilingual landing site (EN/ES/FR) for a Landing Page. Static-first Astro project with Tailwind and Decap CMS editing, plus a Resend-powered contact form. Focused on simplicity, maintainability, and good i18n UX/SEO.

## Overview
- Astro (SSG) with Tailwind utilities only, no React/Vue/Svelte.
- Content managed in Decap CMS (Git-based), editable in `/admin`.
- EN/ES/FR with language-prefixed routes and a language switcher.
- Root redirect (`/`) detects preferred language (cookie/Accept-Language).
- Contact form via Astro Actions + Resend.
- Theme: light/dark with a no-flash script; optional toggle stores preference in `localStorage`.

## Tech Stack
- Astro 5
- Tailwind CSS 4 (utilities, typography via our own Section components)
- fulldev/ui-style Astro components (no client frameworks)
- Decap CMS (admin UI at `/admin`)
- Resend (email delivery)
- Sitemap + robots endpoints

## Quickstart
1) Install dependencies
   - `npm install`
2) Configure environment
   - Copy `.env.example` (if present) to `.env.local` and set variables below.
3) Run dev server
   - `npm run dev` → http://localhost:4321
4) Run Decap CMS Local Backend (for local content editing)
   - First, ensure your `public/admin/config.yml` is configured for local backend. It should contain a `local_backend` section similar to this:
     ```yaml
     local_backend:
       url: http://localhost:8081/api/v1
     ```
   - In a *separate terminal*, start the local Decap CMS server:
     ```bash
     npx decap-server
     ```
   - *Note:* When `npx decap-server` is running, the CMS will automatically use the local backend. Otherwise, it will attempt GitHub OAuth.

5) Open CMS
   - Access the CMS at `http://localhost:4321/admin`.

## Environment Variables
- `RESEND_API_KEY`: API key for Resend
- `EMAIL_FROM`: Sender email (verified in Resend)
- `EMAIL_TO`: Destination email (where messages arrive)
- Optional/Deploy:
  - `SITE_URL`: Absolute site URL for sitemap/canonical (e.g., `https://example.com`)

## Project Structure
```text
public/
  uploads/              # CMS media
  admin/config.yml      # Decap CMS collections & fields
src/
  actions/              # Astro Actions: contact form handler
  components/           # UI atoms/molecules
    blocks/             # Page sections (hero, services, how-it-works, etc.)
    ui/                 # Reusable UI components
  layouts/              # SiteLayout with SEO + theme script
  lib/                  # content loaders, utils
  pages/                # /en, /es, /fr routes and handlers
    index.ts            # Redirect / → /{lang}
    robots.txt.ts       # Robots endpoint
src/content/
  pages/                # Centralized pages (YAML): home.yml, about.yml, ...
  blog_entries/         # Blog posts (YAML, one file per post)
  service_entries/      # Services (YAML, one file per service)
  howitworks_entries/   # How It Works steps (YAML)
  testimonial_entries/  # Testimonials (YAML)
  faq_entries/          # FAQ questions (YAML)
  menus/                # header.yml, footer.yml (YAML lists)
  settings.yml          # Global settings (YAML)
```

## Content & CMS
 - Content is centralized in YAML files under `src/content/`:
  - Pages: `src/content/pages/*.yml` (e.g., `home.yml`, `about.yml`, `blog.yml`, `services.yml`, `testimonials.yml`, `faq.yml`, `contact.yml`, `not-found.yml`).
  - Blog: `src/content/blog_entries/*.yml` (1 file por post con campos localizados).
  - Services: `src/content/service_entries/*.yml` (1 file por servicio con `price`, `price_es`, `price_fr`).
  - How It Works: `src/content/howitworks_entries/*.yml` (pasos con `order`).
  - Testimonials: `src/content/testimonial_entries/*.yml` (1 file por testimonio).
  - FAQ: `src/content/faq_entries/*.yml` (1 file por pregunta).
  - Menús: `src/content/menus/header.yml`, `src/content/menus/footer.yml`.
  - Ajustes: `src/content/settings.yml`.
- Campos localizados usan sufijos por idioma: `_en`, `_es`, `_fr` (ej.: `title_en`, `body_es`). Los campos globales no llevan sufijo (ej.: `slug`, `date`, `image`).
- Media uploads van a `public/uploads/`.
- Edita todo via Decap CMS en `/admin`:
  - Colecciones: “Blog (Unified)”, “Services (Unified)”, “How It Works (Unified)”, “Testimonials (Unified)”, “FAQ (Unified)”, “Pages”, “Settings”.
  - Cada item usa `slug` como identificador y URL/anchor canónico.

### Mapas de URL
- Blog post: `/{lang}/blog/{slug}` (un solo `slug` para todos los idiomas).
- Service: `/{lang}/services/{slug}`.
- How It Works: listado en Home; el `slug` sirve como anchor opcional.
- FAQ, Testimonials: listados en sus páginas índice por idioma.

### Guía de Campos (resumen)
- Blog entry (`src/content/blog_entries/*.yml`): `slug`, `date`, `image?`, `title_*`, `description_*`, `body_*`.
- Service entry (`src/content/service_entries/*.yml`): `slug`, `order`, `image?`, `price`, `price_es?`, `price_fr?`, `title_*`, `description_*`, `body_*`.
- How It Works (`src/content/howitworks_entries/*.yml`): `slug`, `order`, `icon?`, `title_*`, `description_*`, `link_text_*?`, `link_href_*?`.
- Testimonial (`src/content/testimonial_entries/*.yml`): `slug`, `order`, `rating?`, `avatar?`, `author`, `role_*?`, `title_*`, `body_*`.
- FAQ (`src/content/faq_entries/*.yml`): `slug`, `order`, `question_*`, `body_*`.
- Pages (`src/content/pages/*.yml`): campos por página con sufijos de idioma (ej.: `title_en`, `body_es`) y campos globales como imágenes.

## Internationalization
- Locales: `en`, `es`, `fr`.
- Language-prefixed routes: `/en/...`, `/es/...`, `/fr/...`.
- Root `/` redirects to the preferred language using cookie or `Accept-Language`.
- Header includes a language switcher preserving the current path when possible.

## SEO
- `<SEO>` block in `SiteLayout` adds canonical, `hreflang` alternates, robots, OG/Twitter, and base JSON‑LD (WebSite, Person).
- `@astrojs/sitemap` configured; `robots.txt` endpoint included.
- OG image can be set per locale in site settings; falls back to a placeholder if missing.

## Theme (No‑Flash)
- Early inline script in `SiteLayout` sets `html.dark` before styles load using `localStorage.theme` or `prefers-color-scheme`.
- Body uses design tokens (`bg-background`, `text-foreground`); no hardcoded colors.
- Toggle (if present) updates `localStorage.theme`. Cookie storage is optional and not required for SSG.

## Contact Form
- Implemented with Astro Actions in `src/actions/index.ts`.
- Validations: name, email, message length, honeypot; simple rate-limit.
- Sends via Resend using `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`.
- Works with progressive enhancement: JS fetch and no-JS fallback redirect to `/{lang}/contact/success`.

## Scripts
- `npm run dev`: Start dev server
- `npm run build`: Build static site into `dist`
- `npm run preview`: Preview build locally
- `npm run astro ...`: Run Astro CLI

## Deployment
- Static hosting recommended (SSG). Node adapter included for Actions.
- Set `SITE_URL` in production for sitemap and canonical URLs.
- Ensure Resend keys are set; verify `EMAIL_FROM` domain in Resend.
- Decap CMS OAuth (if used) must be configured on the chosen host.

## Notes
- No React/Vue/Svelte; components are `.astro` only.
- Tailwind utilities only; no SCSS/CSS Modules.
- Language redirect is applied only on `/` to avoid SEO issues.
