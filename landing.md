PROMPT — Landing Website con Astro + fulldev/ui + Decap CMS

Actúa como un Senior Frontend Developer experto en Astro.

CONTEXTO DEL PROYECTO
Estoy construyendo un sitio web para una Personal Shopper en Canadá.

El sitio debe ser:
- SSG (Static Site Generation) para máximo SEO
- Simple, mantenible y IA-friendly
- Fácil de editar por personas no técnicas usando un CMS

STACK TÉCNICO OBLIGATORIO
- Astro (SSG)
- Tailwind CSS (solo utility classes en el markup)
- fulldev/ui como base de componentes Astro
- Decap CMS para gestión de contenido
- Netlify como hosting
- i18n obligatorio: Inglés (en), Español (es) y Francés (fr)

RESTRICCIONES IMPORTANTES
- NO React, Vue, Svelte ni shadcn/ui
- NO SCSS, NO CSS Modules
- Solo componentes .astro
- Estilos únicamente con Tailwind
- Código claro, explícito y sin overengineering

ARQUITECTURA DEL PROYECTO
src/
  components/   → componentes pequeños reutilizables
  blocks/       → secciones completas de UI
  pages/
    en/
    fr/
    es/
  lib/          → helpers de contenido

content/
  en/
  fr/
  es/

PÁGINAS QUE DEBEN EXISTIR
Home:
- /en
- /fr
- /es
CMS-driven

About Us:
- /en/about
- /fr/about
- /es/about
CMS-driven

Services:
- /en/services
- /fr/services
- /es/services
CMS-driven

Testimonials:
- /en/testimonials
- /fr/testimonials
- /es/testimonials
CMS-driven

FAQ:
- /en/faq
- /fr/faq
- /es/faq
CMS-driven

Blog:
- /en/blog
- /fr/blog
- /es/blog
- /en/blog/[slug]
- /fr/blog/[slug]
- /es/blog/[slug]
CMS-driven

Contact:
- /en/contact
- /fr/contact
- /es/contact
Estático (Netlify Forms)

ESTRUCTURA DE CONTENIDO
content/
  en/
    home.md
    about.md
    services.md
    testimonials.md
    faq.md
    blog/
      post-1.md
  fr/
    home.md
    about.md
    services.md
    testimonials.md
    faq.md
    blog/
      post-1.md
  es/
    home.md
    about.md
    services.md
    testimonials.md
    faq.md
    blog/
      post-1.md

Cada archivo debe incluir frontmatter SEO y contenido estructurado.

BLOCKS REQUERIDOS
- Header
- Hero
- Services
- HowItWorks
- Testimonials
- FAQ
- CTA
- ContentSection
- BlogList
- BlogPost
- Footer

Cada block:
- Recibe props
- No accede directamente al CMS
- No maneja lógica de idioma
- Solo UI

I18N
- Idiomas: en y fr
- Inglés es default
- Helpers tipo getHome(locale), getBlogPosts(locale)

OBJETIVO FINAL
Generar:
- Estructura completa del proyecto Astro
- Ejemplos claros de blocks
- Ejemplo de contenido Markdown
- Código limpio, predecible y fácil de extender
- Nada de lógica innecesaria

Priorizar:
- SEO
- Simplicidad
- Mantenibilidad
- Buena experiencia de edición en Decap CMS
