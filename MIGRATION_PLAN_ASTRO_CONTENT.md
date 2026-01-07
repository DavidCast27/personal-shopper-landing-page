### Plan de Migración a Astro Content Collections (Actualizado)

**Contexto y Motivación**:

Este plan detalla la migración de nuestro actual sistema de gestión de contenido, basado en la lectura manual de archivos YAML y helpers personalizados, hacia el sistema de **Content Collections nativo de Astro (`astro:content`)**.

La motivación principal para este cambio es mejorar la **mantenibilidad, robustez y eficiencia** de la gestión de contenido del proyecto. Aunque la implementación actual es funcional, la adopción de `astro:content` nos proporcionará los siguientes beneficios clave:

*   **Tipado y Validación de Datos**: Definiremos esquemas estrictos (`schema` con Zod) para cada tipo de contenido. Esto nos dará errores en tiempo de desarrollo si los datos en nuestros archivos YAML no coinciden con la estructura esperada, previniendo bugs y facilitando la depuración.
*   **Código de Acceso a Datos Simplificado**: Astro se encargará de gran parte de la lógica de lectura y procesamiento de archivos, permitiéndonos reemplazar las funciones manuales (`getYaml`, `localizeYaml`, etc.) por llamadas directas y más concisas (`getCollection`, `getEntry`).
*   **Alineación con las Mejores Prácticas de Astro**: Al usar las Content Collections, integramos el proyecto más profundamente con el ecosistema de Astro, lo que puede facilitar futuras actualizaciones y el uso de herramientas específicas de Astro.
*   **Eliminación de Dependencias Externas**: Podremos eliminar la dependencia `js-yaml`, simplificando el árbol de dependencias del proyecto.

---
**Paso 1: [COMPLETADO] Mover Carpetas de Contenido**

*   La carpeta `content/` ha sido movida a `src/content/`.
*   El código ha sido ajustado temporalmente para que el sitio siga funcionando con la nueva ubicación.

---
#### **Paso 2 (Próximo paso): Definir los Esquemas de Contenido**

Este es el paso más importante para activar el poder de las Content Collections. Crearemos un archivo que le dice a Astro cómo es la estructura de nuestros datos.

1.  **Crear el Archivo de Configuración**:
    *   En la raíz del proyecto, crea un nuevo archivo: **`src/content/config.ts`**.

2.  **Definir las Colecciones y sus Esquemas**:
    *   Dentro de `src/content/config.ts`, importa las herramientas necesarias de Astro y Zod (para la validación):
        ```typescript
        import { defineCollection, z } from 'astro:content';
        ```
    *   Ahora, define una constante para **cada una de nuestras colecciones**, especificando que son de tipo `data` (porque son archivos YAML) y describiendo cada campo con su tipo de dato usando `z.object({})`.

    *   **Ejemplo de cómo empezar con la colección `blog_entries`**:
        ```typescript
        const blogCollection = defineCollection({
          type: 'data',
          schema: z.object({
            slug: z.string(),
            date: z.string().transform((str) => new Date(str)), // Astro Content Collections expect Date objects, so transform the string from YAML
            image: z.string().optional(),
            title_en: z.string(),
            description_en: z.string().optional(),
            body_en: z.string().optional(),
            // Repetir para _es y _fr
            title_es: z.string(),
            description_es: z.string().optional(),
            body_es: z.string().optional(),
            title_fr: z.string(),
            description_fr: z.string().optional(),
            body_fr: z.string().optional(),
          })
        });
        ```
    *   **Acción**: Haz esto para **todas** las colecciones que ahora viven en `src/content/`:
        *   `blog_entries`
        *   `faq_entries`
        *   `howitworks_entries`
        *   `menus`
        *   `pages`
        *   `service_entries`
        *   `settings`
        *   `testimonial_entries`

3.  **Exportar las Colecciones**:
    *   Al final del archivo `src/content/config.ts`, exporta todas las colecciones que definiste en un solo objeto `collections`:
        ```typescript
        export const collections = {
          'blog_entries': blogCollection,
          // ...y todas las demás...
          'pages': pagesCollection,
          'settings': settingsCollection,
          'menus': menusCollection,
          'faq_entries': faqCollection,
          'howitworks_entries': howitworksCollection,
          'service_entries': serviceCollection,
          'testimonial_entries': testimonialCollection,
        };
        ```

**Verificación del Paso 2**: Al guardar este archivo, el servidor de desarrollo de Astro (`npm run dev`) intentará procesar tu contenido. Si hay algún error de tipo (por ejemplo, un campo `date` mal formateado) o algún campo que no coincide entre tus archivos `.yml` y los esquemas que definiste, **Astro te avisará en la consola**. Este es el primer gran beneficio: ¡validación automática de datos!

---
#### **Paso 3: Refactorizar el Código para Usar `getCollection` y `getEntry`**

Una vez que los esquemas estén definidos y sin errores, reemplazaremos nuestra lógica manual en `src/lib/content.ts` con las funciones nativas de Astro.

1.  **Refactorizar Funciones de Entradas Múltiples** (ej. `getBlogPosts`, `getServices`, `getFaq`, `getTestimonials`, `getHowItWorks`):
    *   **Acción**: Modifica cada una de estas funciones para que usen `getCollection('<nombre_de_la_colección>')`.
    *   **Ejemplo de cómo se vería `getBlogPosts`**:
        ```typescript
        import { getCollection } from 'astro:content';
        // ...

        export async function getBlogPosts(locale: Lang): Promise<BlogListItem[]> {
          const posts = await getCollection('blog_entries'); // Usamos el nombre de la colección definido en config.ts
          return posts.map(post => {
            const data = post.data; // Los datos ya están validados por Zod
            return {
              slug: post.slug, // Astro provee el slug directamente (nombre del archivo sin extensión)
              locale,
              path: post.id, // ID de la entrada, similar a la ruta interna de Astro
              frontmatter: {
                  title: data[`title_${locale}`],
                  description: data[`description_${locale}`],
                  date: data.date,
                  image: data.image,
              },
              body: data[`body_${locale}`] || '', // Acceder al body localizado
              title: data[`title_${locale}`],
              description: data[`description_${locale}`] || '',
              image: data.image || undefined,
            } as BlogListItem;
          }).sort((a, b) => {
            const da = new Date((a.frontmatter?.date as Date) || 0).getTime() // frontmatter.date ya es un Date
            const db = new Date((b.frontmatter?.date as Date) || 0).getTime()
            return db - da
          });
        }
        ```
    *   **Nota**: `post.slug` en `astro:content` se refiere al nombre del archivo sin extensión. `post.data` ya contiene todos los campos definidos en el esquema.

2.  **Refactorizar Funciones de Entradas Únicas** (ej. `getSiteSettings`, `getNewHeaderMenu`, `getNewFooterLinks`, `getPage`, `getPost`, `getService`, `getNotFound`):
    *   **Acción**: Modifica cada una de estas funciones para que usen `getEntry('<nombre_de_la_colección>', '<nombre_del_archivo_sin_extension>')`.
    *   **Ejemplo de cómo se vería `getSiteSettings`**:
        ```typescript
        import { getEntry } from 'astro:content';
        // ...

        export async function getSiteSettings(locale: Lang): Promise<SiteSettings | undefined> {
          const entry = await getEntry('settings', 'settings'); // Colección 'settings', archivo 'settings.yml'
          if (!entry) return undefined;

          const data = entry.data; // Datos validados por Zod

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
        ```
    *   **Acción**: Repite este proceso para:
        *   `getNewHeaderMenu` (usando `getEntry('menus', 'header')`)
        *   `getNewFooterLinks` (usando `getEntry('menus', 'footer')`)
        *   `getPage` (usando `getEntry('pages', key)`)
        *   `getPost` (usando `getEntry('blog_entries', slug)`)
        *   `getService` (usando `getEntry('service_entries', slug)`)
        *   `getNotFound` (usando `getEntry('pages', 'not-found')`)

---
#### **Paso 4: Limpieza Final**

1.  **Eliminar Código Innecesario**:
    *   Una vez que todas las funciones en `src/lib/content.ts` usen `getCollection` o `getEntry`, elimina las importaciones de `fs/promises` y `yaml`, así como las funciones auxiliares `getYaml`, `listYamlFiles`, y `localizeYaml`.
    *   También puedes eliminar las interfaces `Frontmatter` si ya no se utilizan directamente.

2.  **Desinstalar `js-yaml`**:
    *   Ejecuta `npm uninstall js-yaml` para eliminar la dependencia del proyecto.

**Verificación Final**: Ejecuta `npm run build` para asegurarte de que el proyecto construye correctamente y navega por el sitio en `npm run dev` para confirmar que todos los datos se muestran como se espera. La consola de desarrollo de Astro (`npm run dev`) te dará advertencias o errores si hay algún problema con los *schemas* o la carga de datos.