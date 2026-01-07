# Añadir un nuevo idioma

Esta guía explica cómo agregar un nuevo idioma (p. ej. `pt`) al sitio.

Requisitos previos:
- Estructura actual con rutas dinámicas `src/pages/[lang]/...`.
- Contenido en `/content/<lang>/...`.

## 1) Declarar el idioma en el código

- Edita `src/lib/lang.ts` y agrega el código a `SUPPORTED`:

```ts
export const SUPPORTED = ['en', 'es', 'fr', 'pt'] as const
export type Lang = typeof SUPPORTED[number]
```

- Verifica que los lugares que dependen de `SUPPORTED` usen el array exportado (ya lo hacen):
  - Redirección por idioma: `src/pages/index.ts`
  - 404: `src/pages/404.astro`

## 2) Traducciones de interfaz (i18n)

- Edita `src/lib/i18n.ts` y añade el diccionario para el nuevo idioma con las claves existentes:

```ts
const pt: Dict = {
  'breadcrumb.home': 'Início',
  'breadcrumb.blog': 'Blog',
  'article.author': 'Autor',
  'empty.blog.title': 'Ainda não há artigos',
  'empty.blog.description': 'Estamos preparando conteúdo. Volte em breve.',
  'empty.services.title': 'Ainda não há serviços disponíveis',
  'empty.services.description': 'Estamos preparando nossos serviços. Volte em breve.',
  'empty.faq.title': 'Ainda não há perguntas frequentes',
  'empty.faq.description': 'Estamos reunindo perguntas frequentes. Volte em breve.',
  'empty.testimonials.title': 'Ainda não há depoimentos',
  'empty.testimonials.description': 'Estamos coletando opiniões. Volte em breve.',
  'contact.success.title': 'Obrigado',
  'contact.success.heading': 'Obrigado!',
  'contact.success.description': 'Recebemos sua mensagem e entraremos em contato em breve.',
  'contact.success.back': 'Voltar ao início',
}

const D: Record<Lang, Dict> = { en, es, fr, pt }
```

## 3) Contenido por idioma

Crea la carpeta `content/pt` con los archivos mínimos. Estructura recomendada:

```
content/pt/
  site.md                  # Ajustes del sitio (logo, CTA, etc.)
  home.md                  # Portada
  about.md                 # Sobre mí/nosotros
  blog/                    # Entradas del blog (opcional)
    minha-primeira-postagem.md
  services/                # Servicios (cada servicio en un .md)
    servico-1.md
    servico-2.md
  faq/
    pergunta-1.md
  testimonials/
    depoimento-1.md
  howitworks/
    passo-1.md
  nav/
    header/
      link-1.md
  footer/
    links/
      categoria-1.md
  not-found.md             # Copia para 404 (opcional; hay defaults)
```

Campos útiles de frontmatter (según `src/lib/content.ts`):
- Páginas (`home.md`, `about.md`, `services.md`, `blog.md`, `faq.md`, `testimonials.md`, `contact.md`): `title`, `description`.
- Home: `hero_*`, `services_*`, `steps_title`, `cta_*`.
- Servicios: por archivo en `services/` → `title`, `description`, `image`, `price`, `order`.
- FAQ: `question`, `order`.
- Testimonios: `title`, `author`, `role`, `avatar`, `rating`, `order`.
- Navegación/footers: `text`, `href`, `order`, etc.

## 4) Rutas dinámicas `[lang]`

Ya no necesitas tocar `getStaticPaths` al agregar un idioma.

Todas las páginas usan helpers centrales desde `src/lib/lang.ts`:
- `staticPathsForLang()` en páginas sin slug
- `staticPathsForSlugs(fetchByLang)` en páginas con slug (blog/services)

Si creas una nueva página `[lang]/algo.astro`, usa:

```ts
import { staticPathsForLang } from '@/lib/lang'
export function getStaticPaths() { return staticPathsForLang() }
```

Si creas una nueva colección `[lang]/algo/[slug].astro`, usa:

```ts
import { staticPathsForSlugs } from '@/lib/lang'
// asumiendo getAlgo(lang) -> { slug: string }[]
export async function getStaticPaths() { return staticPathsForSlugs(getAlgo) }
```

## 5) SEO, layout y selector de idioma

- `src/components/blocks/SEO.astro` ya usa `SUPPORTED`/`Lang` para alternates (`hreflang`). Solo ajusta `mapOgLocale` si deseas un locale OG específico (p. ej., `pt_BR` o `pt_PT`).
- `src/layouts/SiteLayout.astro` ya usa `Lang`.
- `src/components/ui/lang-switcher` también consume `SUPPORTED`, por lo que el nuevo idioma aparece automáticamente.

## 6) Acciones del formulario de contacto

- `src/actions/index.ts` ya valida el idioma con `isLang`/`Lang` desde `src/lib/lang.ts`. No requiere cambios.

## 7) Redirecciones e index

- `src/pages/index.ts` ya usa `SUPPORTED` para elegir idioma por cookie/`Accept-Language`. No requiere cambios si agregaste el idioma a `SUPPORTED`.
- `src/pages/404.astro` también usa `SUPPORTED` para detectar idioma en la URL.

## 8) Verificar

- Construye y previsualiza:

```bash
npm run build && npm run preview
```

- Prueba rutas clave:
  - `/<lang>/` (home)
  - `/<lang>/about`
  - `/<lang>/services` y `/<lang>/services/<slug>`
  - `/<lang>/blog` y `/<lang>/blog/<slug>`
  - `/<lang>/faq`, `/<lang>/testimonials`, `/<lang>/contact`, `/<lang>/contact/success`

## 9) Checklist rápido

- [ ] `SUPPORTED` actualizado y tipos consistentes.
- [ ] Diccionario `i18n` con todas las claves necesarias.
- [ ] Contenido base creado en `content/<lang>/...`.
- [ ] SEO `mapOgLocale` ajustado si aplica.
- [ ] Build y preview sin errores.

---
