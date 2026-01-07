# Añadir un nuevo idioma

Esta guía explica cómo agregar un nuevo idioma (p. ej. `pt`) al sitio.

Requisitos previos:
- Rutas dinámicas `src/pages/[lang]/...`.
- Contenido unificado en YAML bajo `src/content/**` (no hace falta crear carpetas por idioma).

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

## 3) Contenido por idioma (YAML unificado)

No se crean carpetas por idioma. En su lugar, agrega campos con sufijo `_pt` en los YAML existentes dentro de `src/content/**`.

Dónde editar:
- Páginas: `src/content/pages/*.yml` (home, about, blog, services, testimonials, faq, contact, not-found)
- Blog: `src/content/blog_entries/*.yml`
- Servicios: `src/content/service_entries/*.yml`
- How It Works: `src/content/howitworks_entries/*.yml`
- Testimonios: `src/content/testimonial_entries/*.yml`
- FAQ: `src/content/faq_entries/*.yml`
- Menús: `src/content/menus/{header,footer}.yml`
- Ajustes: `src/content/settings.yml`

Convenciones de campos:
- Campos localizados: añade sufijo `_pt` (ej.: `title_pt`, `description_pt`, `body_pt`, `hero_title_pt`, `question_pt`, `link_text_pt`, etc.).
- Campos globales: sin sufijo (ej.: `slug`, `date`, `image`, `order`).
- Precio en servicios: el loader ya usa `price_pt` si existe, y si no, cae en `price`.

Importante: reflejar estos campos en el CMS.
- Edita `public/admin/config.yml` y agrega los campos para PT en cada colección y página (p. ej., “Title (PT) → name: title_pt”, “Body (PT) → name: body_pt”, etc.).
- En servicios puedes añadir “Price (PT) → name: price_pt” si deseas precio localizado.

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

## 5.5) Carga de YAML localizada

El helper `localizeYaml` actualmente mapea claves con sufijo fijo. Si agregas un idioma nuevo, asegúrate de que soporte ese sufijo:

Opciones:
- Rápida: añade `pt` al regex dentro de `localizeYaml` en `src/lib/content.ts`.
- Recomendado: generaliza `localizeYaml` para usar la lista `SUPPORTED` y detectar cualquier sufijo dinámicamente.

¿Quieres que lo deje dinámico ahora? Puedo actualizarlo en el código.

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
  - Revisa que el contenido PT aparezca al completar campos `_pt` en YAML.

## 9) Checklist rápido

- [ ] `SUPPORTED` actualizado y tipos consistentes.
- [ ] Diccionario `i18n` con todas las claves necesarias.
- [ ] Campos `_pt` añadidos en `src/content/**` según corresponda.
- [ ] `public/admin/config.yml` actualizado con campos PT en Pages y colecciones.
- [ ] SEO `mapOgLocale` ajustado si aplica.
- [ ] Build y preview sin errores.

---
