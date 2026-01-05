# Pendientes del proyecto

Este documento centraliza tareas y decisiones abiertas. Estado actual: CMS y contenido estructurado funcionando (EN/ES/FR), OAuth Decap OK. Lo crítico inmediato es el formulario de contacto.

## Completado — Formulario de Contacto
Estado: Finalizado — Astro Actions + Resend (Node adapter).

- Flujo actual:
  - `src/actions/index.ts` → `actions.contact` con rate‑limit, honeypot, i18n.
  - Envío por Resend (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`), reply‑to al usuario.
  - Formularios EN/ES/FR usan `action={actions.contact}` + fetch (fallback sin JS con redirect a `/[lang]/contact/success`).
- Validaciones:
  - Nombre: 2–80; Email válido; Mensaje: 10–2000; Honeypot vacío.
- Seguridad:
  - Rate‑limit por IP (in‑memory), same‑origin implícito, sanitización al enviar email.
- Pendiente opcional:
  - Integrar Turnstile/reCAPTCHA si sube el spam.
  - Persistir logs/ratelimit en Redis si escalamos instancias.

## Completado — SEO inicial
Estado: Finalizado — base técnica y metadatos esenciales.

- Layout: bloque SEO con canonical absoluto y `hreflang` EN/ES/FR + `x-default`.
- Open Graph/Twitter: metadatos base y fallback de imagen OG por defecto.
- Sitemap: integrado con `@astrojs/sitemap` y `site` configurado en `astro.config.mjs`.
- Robots: `src/pages/robots.txt.ts` dinámico con enlaces a sitemap.
  - JSON‑LD base: `WebSite` y `Person` inyectados desde el layout.

## Completado — How It Works
Estado: Finalizado — bloque + contenido CMS + integración.

- CMS: colecciones `howitworks_en/es/fr` con `title`, `description`, `order`, `icon?`, `link_*?`.
- Data loader: `getHowItWorks(locale)` en `src/lib/content.ts`.
- UI: `src/components/blocks/how-it-works-1.astro` como timeline horizontal, tarjetas de igual alto y CTA opcional.
- Integrado en Home de EN/ES/FR debajo de Services.

## Completado — ContentSection (no requerido)
Estado: Cerrado — ya cubierto con `src/components/ui/section/*`.

- Decisión: no se crea un bloque aparte; se reutilizan `Section`, `SectionProse`, `SectionContent`, etc., para contenido estático.

## Completado — Producción (desestimado por ahora)
Estado: Cerrado — despliegue fuera de alcance en esta fase.

- Decisión: posponer elección de hosting (Netlify vs Node), configuración de `SITE_URL`, `public/admin/config.yml` (`base_url`) y OAuth GitHub en el host. Se retomará cuando planifiquemos producción.

## Importante (próximas iteraciones)
- Imágenes: reemplazar placeholders por imágenes reales desde el CMS.

 

## Mejoras futuras
- SEO/i18n: base lista; refinar OG por página/post, JSON‑LD avanzado, 404/500, y enlazado interno.
- Accesibilidad: revisión semántica, focus visible, labels/aria en formularios.
- Parser Markdown: si se requiere soporte completo (tablas/código), integrar remark/markdown‑it.
- Tests básicos: utils de contenido, endpoint `/api/contact` y rutas críticas.
- Seguridad OAuth: agregar verificación de `state` (CSRF) en `/oauth`.
- Documentación: README con guías de CMS, OAuth (local/prod), despliegue y variables.

## TODOs pendientes menores
- Reemplazar imagen OG por defecto por una imagen de marca 1200×630 por idioma (actualmente usa placeholder). 

## Datos/decisiones que necesitamos
- Proveedor para emails (Resend/SendGrid/SMTP) y direcciones `from`/`to`.
- Dominio de producción.
- Preferencias de captcha (Cloudflare Turnstile / reCAPTCHA) o solo honeypot + rate‑limit.

## UI/UX Tema + Idioma (pendiente)

1) Theme toggle persistente y sin FOUC
- Persistencia SSR: además de `localStorage`, setear cookie `theme=dark|light; Path=/; Max-Age=31536000` al togglear.
- Render SSR con el tema guardado: leer cookie en un middleware o en el layout y renderizar `<html class="dark">` cuando corresponda para evitar flash (FOUC). Mantener fallback a `prefers-color-scheme` cuando no hay cookie.
- No-flash snippet: incluir un script inline mínimo en `<head>` que lea cookie/localStorage y ajuste `classList`/`data-theme` antes del render visual.
- Sincronización: al cambiar tema, actualizar `documentElement.classList`, `data-theme`, `localStorage` y cookie; considerar evento `storage` para sincronizar entre pestañas.
- Accesibilidad: asegurar `aria-pressed`/label correcto en el toggle.

2) Contraste en modo oscuro
- Revisar variables de color en `src/styles/tailwind.css` (sección `.dark { ... }`): elevar contraste de `--foreground`, `--muted-foreground`, `--input`, `--border`, etc., y verificar con WCAG AA (nivel texto normal y pequeño).
- Prose en dark: aplicar `prose-invert` o estilos equivalentes para contenido Markdown y blocks que generan texto largo.
- Bloques específicos: revisar `hero-3.astro` (overlay/gradientes), `footer-1.astro`, cabeceras y enlaces para asegurar contraste y estados hover/focus visibles.
- Tokens consistentes: preferir clases basadas en `text-foreground`/`bg-background` en lugar de grises fijos.
- Pruebas: validar con herramientas (axe/lighthouse) y ajustar hasta AA como mínimo.

3) Selector de idioma y/o autodetección
- Selector en header: componente simple que detecte el idioma actual por la ruta (`/en|/es|/fr`) y ofrezca enlaces a la misma ruta equivalente en los otros idiomas (respetando slug base si aplica).
- Autodetección (opcional, solo primera visita):
  - Cliente: leer `navigator.language` (o `languages`) y mapear a `en|es|fr`.
  - Servidor: opcionalmente, leer `Accept-Language` para redirección del root `/` a la ruta preferida.
  - Guardar preferencia en cookie `lang` para no re-redirigir en visitas siguientes.
  - SEO: aplicar redirección sólo en `/` (no en rutas profundas) y exponer `link rel="alternate" hreflang` por página.
- Integración con CMS: no impacta; solo cambia prefijo de ruta.
- Accesibilidad: indicar idioma con `lang` en `html` y labels del selector traducidos.

## SEO (pendiente, plan detallado)

- Metadatos base en `SiteLayout`:
  - Title y meta description por página desde CMS (longitud: title ≤ 60, description 120–160 chars).
  - Canonical absoluto (`<link rel="canonical">`) por idioma y ruta; definir política de trailing slash.
  - Robots meta por página (noindex para admin, páginas de sistema, previews).
- Open Graph / Twitter Cards:
  - `og:title`, `og:description`, `og:url`, `og:locale`, `og:type` (`website`/`article`), `og:image` con dimensiones 1200×630.
  - Twitter `summary_large_image`.
  - Imagen OG por defecto por idioma y permitir override desde CMS (blog/posts/services si aplica).
- hreflang alternates:
  - Añadir `<link rel="alternate" hreflang="en|es|fr|x-default">` entre equivalentes de cada página.
  - Para posts, mapear slugs por idioma si difieren (si no, usar mismas rutas con prefijos).
- Structured Data (JSON‑LD):
  - `WebSite` + `SearchAction` (sitio), `Organization`/`Person` (según branding), `BreadcrumbList` (blog/listado/post), `BlogPosting` (post), `FAQPage` (FAQ), `Service` (items Services), `ContactPage`.
  - Generar desde datos CMS (title/description/body, price para `Service`, Q&A para `FAQPage`).
- Sitemap/robots:
  - Generar `/sitemap.xml` incluyendo EN/ES/FR (Home, estáticas, blog, posts). Excluir `/admin`, endpoints.
  - `robots.txt` permitiendo crawl del sitio y `Sitemap: https://dominio/sitemap.xml`.
- Imágenes y accesibilidad SEO:
  - `alt` descriptivo desde CMS, `width/height` definidos, `loading="lazy"` donde aplique.
  - Favicon/manifest y `theme-color` por modo.
- Enlazado interno:
  - Asegurar enlaces desde Home a About/Services/Blog/Contact y viceversa; posts con “related” (opcional) y enlaces a categorías (si se agregan).
- Técnica:
  - 404 y 500 por idioma, devolver códigos correctos.
  - Evitar contenido duplicado y redirecciones innecesarias; 301 de `/` a idioma preferido/por defecto.
  - Medir con Lighthouse/Search Console y ajustar.
