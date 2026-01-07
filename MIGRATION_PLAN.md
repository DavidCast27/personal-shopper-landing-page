### Plan de Migración Detallado para la Unificación del CMS

Aquí está el plan detallado, dividido en fases y secciones, para continuar con la refactorización y unificación de la configuración del CMS.

---

#### **Fase 1: Unificar las Colecciones de Carpetas (Blog, Servicios, FAQ, etc.)**

Esta fase se centra en los contenidos que tienen múltiples entradas, como los posts del blog o los diferentes servicios. El código de la aplicación ya está preparado para esta estructura.

**1. Sección: Blog Posts**
    *   **1.1. Unificar Colección (config.yml)**:
        *   Eliminar las colecciones `blog_en`, `blog_es`, y `blog_fr` de `public/admin/config.yml`.
        *   Crear una única colección `blog` con la propiedad `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "blog"
              label: "Blog"
              folder: "content/{{locale}}/blog"
              create: true
              i18n: true
              fields:
                - { label: "Title", name: "title", widget: "string" }
                - { label: "Description", name: "description", widget: "text", required: false }
                - { label: "Date", name: "date", widget: "datetime" }
                - { label: "Image", name: "image", widget: "image", required: false }
                - { label: "Body", name: "body", widget: "markdown" }
            ```
    *   **1.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getBlogPosts` ya busca en `content/${locale}/blog/`, por lo que **no debería necesitar cambios**.

**2. Sección: Servicios (Services)**
    *   **2.1. Unificar Colección (config.yml)**:
        *   Eliminar `services_en`, `services_es`, y `services_fr`.
        *   Crear una única colección `services` con `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "services"
              label: "Services"
              folder: "content/{{locale}}/services"
              create: true
              i18n: true
              fields:
                - { label: "Title", name: "title", widget: "string" }
                - { label: "Description", name: "description", widget: "text", required: false }
                - { label: "Price", name: "price", widget: "string", required: false }
                - { label: "Image", name: "image", widget: "image", required: false }
                - { label: "Order", name: "order", widget: "number", required: false, value_type: "int", min: 0 }
                - { label: "Body", name: "body", widget: "markdown", required: false }
            ```
    *   **2.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getServices` ya busca en `content/${locale}/services/`, por lo que **no debería necesitar cambios**.

**3. Sección: Preguntas Frecuentes (FAQ)**
    *   **3.1. Unificar Colección (config.yml)**:
        *   Eliminar `faq_items_en`, `faq_items_es`, y `faq_items_fr`.
        *   Crear una única colección `faq_items` con `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "faq_items"
              label: "FAQ Items"
              folder: "content/{{locale}}/faq"
              create: true
              i18n: true
              fields:
                - { label: "Question", name: "question", widget: "string" }
                - { label: "Order", name: "order", widget: "number", required: false, value_type: "int", min: 0 }
                - { label: "Answer", name: "body", widget: "markdown" }
            ```
    *   **3.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getFaq` ya busca en `content/${locale}/faq/`, por lo que **no debería necesitar cambios**.

**4. Sección: Testimonios (Testimonials)**
    *   **4.1. Unificar Colección (config.yml)**:
        *   Eliminar `testimonials_en`, `testimonials_es`, y `testimonials_fr`.
        *   Crear una única colección `testimonials` con `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "testimonials"
              label: "Testimonials"
              folder: "content/{{locale}}/testimonials"
              create: true
              i18n: true
              fields:
                - { label: "Title", name: "title", widget: "string" }
                - { label: "Author", name: "author", widget: "string" }
                - { label: "Role", name: "role", widget: "string", required: false }
                - { label: "Rating", name: "rating", widget: "number", value_type: "int", min: 1, max: 5, required: false }
                - { label: "Avatar", name: "avatar", widget: "image", required: false }
                - { label: "Order", name: "order", widget: "number", required: false, value_type: "int", min: 0 }
                - { label: "Quote", name: "body", widget: "markdown" }
            ```
    *   **4.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getTestimonials` ya busca en `content/${locale}/testimonials/`, por lo que **no debería necesitar cambios**.

**5. Sección: Cómo Funciona (How It Works)**
    *   **5.1. Unificar Colección (config.yml)**:
        *   Eliminar `howitworks_en`, `howitworks_es`, y `howitworks_fr`.
        *   Crear una única colección `howitworks` con `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "howitworks"
              label: "How It Works"
              folder: "content/{{locale}}/howitworks"
              create: true
              i18n: true
              fields:
                - { label: "Title", name: "title", widget: "string" }
                - { label: "Description", name: "description", widget: "text" }
                - { label: "Icon (optional)", name: "icon", widget: "string", required: false }
                - { label: "Order", name: "order", widget: "number", value_type: "int", min: 0 }
                - { label: "Link Text", name: "link_text", widget: "string", required: false }
                - { label: "Link Href", name: "link_href", widget: "string", required: false }
            ```
    *   **5.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getHowItWorks` ya busca en `content/${locale}/howitworks/`, por lo que **no debería necesitar cambios**.

---

#### **Fase 2: Unificar las Páginas Principales (Home, About, Contacto, etc.)**

Esta fase se enfoca en las páginas estáticas que actualmente están duplicadas por idioma. Migraremos el contenido de archivos Markdown a archivos de datos YAML para mantener la consistencia con `settings.yml` y los menús.

**1. Sección: Páginas Principales**
    *   **1.1. Unificar Colección (config.yml)**:
        *   Eliminar las colecciones `pages_en`, `pages_es`, y `pages_fr` de `public/admin/config.yml`.
        *   Crear una nueva colección `pages` de tipo `files` en `config.yml`.

    *   **1.2. Migración de Contenido y Configuración de Archivos (config.yml)**:
        *   Para cada página principal (`Home`, `About`, `Contact`, `Services` (page), `Testimonials` (page), `FAQ` (page), `Not Found` (404)):
            *   **Crear Nuevo Archivo YAML**: Crear un archivo `.yml` en una nueva carpeta centralizada, por ejemplo: `content/pages/home.yml`, `content/pages/about.yml`, etc.
            *   **Migrar Datos**: Leer el frontmatter de los archivos `.md` de cada idioma (ej. `content/en/home.md`, `content/es/home.md`).
            *   **Combinar Campos**: En el nuevo archivo `.yml`, combinar los datos, usando sufijos `_en`, `_es`, `_fr` para cada campo que contenga texto o URL traducibles. Los campos que no son de texto (ej. `hero_image`) pueden ser globales si no requieren traducción.
            *   **Añadir Entrada en `pages` Collection**: Añadir una entrada para este nuevo archivo en la sección `files` de la colección `pages` en `config.yml`, especificando el `label`, `name` y la ruta `file`.

    *   **1.3. Actualización de Código (`src/lib/content.ts`)**:
        *   Modificar las funciones que recuperan el contenido de estas páginas (ej. `getHome`, `getPage` para las páginas genéricas de `pages_*`):
            *   Estas funciones ahora leerán desde los nuevos archivos `.yml` centralizados en lugar de los `.md` específicos de cada idioma.
            *   Deberán parsear el YAML y seleccionar los campos correctos según el `locale` recibido (ej. `data.title_en` si `locale` es `en`).

    *   **1.4. Limpieza**:
        *   Eliminar los antiguos archivos `.md` de las páginas (`content/{lang}/home.md`, `content/{lang}/about.md`, etc.).

---

#### **Verificación Final**

*   Después de cada paso significativo (especialmente al terminar cada sección de la Fase 1, y al terminar cada sub-paso de la Fase 2), ejecutar `npm run build` para asegurar que el sitio sigue construyendo correctamente.
*   Al finalizar ambas fases, se recomienda iniciar el servidor de desarrollo (`npm run dev`) y navegar por el sitio y el CMS para confirmar que toda la información se muestra correctamente y que la edición en el CMS funciona como se espera.

---
This plan is detailed and covers all aspects. I will create the `MIGRATION_PLAN.md` file now.<ctrl95>Okay, entendido. Voy a crear un archivo `MIGRATION_PLAN.md` en la raíz del proyecto con el plan detallado para la migración del CMS.

### Plan de Migración Detallado para la Unificación del CMS

Aquí está el plan detallado, dividido en fases y secciones, para continuar con la refactorización y unificación de la configuración del CMS.

---

#### **Fase 1: Unificar las Colecciones de Carpetas (Blog, Servicios, FAQ, etc.)**

Esta fase se centra en los contenidos que tienen múltiples entradas, como los posts del blog o los diferentes servicios. El código de la aplicación ya está preparado para esta estructura.

**1. Sección: Blog Posts**
    *   **1.1. Unificar Colección (config.yml)**:
        *   Eliminar las colecciones `blog_en`, `blog_es`, y `blog_fr` de `public/admin/config.yml`.
        *   Crear una única colección `blog` con la propiedad `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "blog"
              label: "Blog"
              folder: "content/{{locale}}/blog"
              create: true
              i18n: true
              fields:
                - { label: "Title", name: "title", widget: "string" }
                - { label: "Description", name: "description", widget: "text", required: false }
                - { label: "Date", name: "date", widget: "datetime" }
                - { label: "Image", name: "image", widget: "image", required: false }
                - { label: "Body", name: "body", widget: "markdown" }
            ```
    *   **1.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getBlogPosts` ya busca en `content/${locale}/blog/`, por lo que **no debería necesitar cambios**.

**2. Sección: Servicios (Services)**
    *   **2.1. Unificar Colección (config.yml)**:
        *   Eliminar `services_en`, `services_es`, y `services_fr`.
        *   Crear una única colección `services` con `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "services"
              label: "Services"
              folder: "content/{{locale}}/services"
              create: true
              i18n: true
              fields:
                - { label: "Title", name: "title", widget: "string" }
                - { label: "Description", name: "description", widget: "text", required: false }
                - { label: "Price", name: "price", widget: "string", required: false }
                - { label: "Image", name: "image", widget: "image", required: false }
                - { label: "Order", name: "order", widget: "number", required: false, value_type: "int", min: 0 }
                - { label: "Body", name: "body", widget: "markdown", required: false }
            ```
    *   **2.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getServices` ya busca en `content/${locale}/services/`, por lo que **no debería necesitar cambios**.

**3. Sección: Preguntas Frecuentes (FAQ)**
    *   **3.1. Unificar Colección (config.yml)**:
        *   Eliminar `faq_items_en`, `faq_items_es`, y `faq_items_fr`.
        *   Crear una única colección `faq_items` con `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "faq_items"
              label: "FAQ Items"
              folder: "content/{{locale}}/faq"
              create: true
              i18n: true
              fields:
                - { label: "Question", name: "question", widget: "string" }
                - { label: "Order", name: "order", widget: "number", required: false, value_type: "int", min: 0 }
                - { label: "Answer", name: "body", widget: "markdown" }
            ```
    *   **3.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getFaq` ya busca en `content/${locale}/faq/`, por lo que **no debería necesitar cambios**.

**4. Sección: Testimonios (Testimonials)**
    *   **4.1. Unificar Colección (config.yml)**:
        *   Eliminar `testimonials_en`, `testimonials_es`, y `testimonials_fr`.
        *   Crear una única colección `testimonials` con `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "testimonials"
              label: "Testimonials"
              folder: "content/{{locale}}/testimonials"
              create: true
              i18n: true
              fields:
                - { label: "Title", name: "title", widget: "string" }
                - { label: "Author", name: "author", widget: "string" }
                - { label: "Role", name: "role", widget: "string", required: false }
                - { label: "Rating", name: "rating", widget: "number", value_type: "int", min: 1, max: 5, required: false }
                - { label: "Avatar", name: "avatar", widget: "image", required: false }
                - { label: "Order", name: "order", widget: "number", required: false, value_type: "int", min: 0 }
                - { label: "Quote", name: "body", widget: "markdown" }
            ```
    *   **4.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getTestimonials` ya busca en `content/${locale}/testimonials/`, por lo que **no debería necesitar cambios**.

**5. Sección: Cómo Funciona (How It Works)**
    *   **5.1. Unificar Colección (config.yml)**:
        *   Eliminar `howitworks_en`, `howitworks_es`, y `howitworks_fr`.
        *   Crear una única colección `howitworks` con `i18n: true` y la ruta de la carpeta dinámica:
            ```yaml
            - name: "howitworks"
              label: "How It Works"
              folder: "content/{{locale}}/howitworks"
              create: true
              i18n: true
              fields:
                - { label: "Title", name: "title", widget: "string" }
                - { label: "Description", name: "description", widget: "text" }
                - { label: "Icon (optional)", name: "icon", widget: "string", required: false }
                - { label: "Order", name: "order", widget: "number", value_type: "int", min: 0 }
                - { label: "Link Text", name: "link_text", widget: "string", required: false }
                - { label: "Link Href", name: "link_href", widget: "string", required: false }
            ```
    *   **5.2. Revisión de Código (`src/lib/content.ts`)**:
        *   La función `getHowItWorks` ya busca en `content/${locale}/howitworks/`, por lo que **no debería necesitar cambios**.

---

#### **Fase 2: Unificar las Páginas Principales (Home, About, Contacto, etc.)**

Esta fase se enfoca en las páginas estáticas que actualmente están duplicadas por idioma. Migraremos el contenido de archivos Markdown a archivos de datos YAML para mantener la consistencia con `settings.yml` y los menús.

**1. Sección: Páginas Principales**
    *   **1.1. Unificar Colección (config.yml)**:
        *   Eliminar las colecciones `pages_en`, `pages_es`, y `pages_fr` de `public/admin/config.yml`.
        *   Crear una nueva colección `pages` de tipo `files` en `config.yml`.

    *   **1.2. Migración de Contenido y Configuración de Archivos (config.yml)**:
        *   Para cada página principal (`Home`, `About`, `Contact`, `Services` (page), `Testimonials` (page), `FAQ` (page), `Not Found` (404)):
            *   **Crear Nuevo Archivo YAML**: Crear un archivo `.yml` en una nueva carpeta centralizada, por ejemplo: `content/pages/home.yml`, `content/pages/about.yml`, etc.
            *   **Migrar Datos**: Leer el frontmatter de los archivos `.md` de cada idioma (ej. `content/en/home.md`, `content/es/home.md`).
            *   **Combinar Campos**: En el nuevo archivo `.yml`, combinar los datos, usando sufijos `_en`, `_es`, `_fr` para cada campo que contenga texto o URL traducibles. Los campos que no son de texto (ej. `hero_image`) pueden ser globales si no requieren traducción.
            *   **Añadir Entrada en `pages` Collection**: Añadir una entrada para este nuevo archivo en la sección `files` de la colección `pages` en `config.yml`, especificando el `label`, `name` y la ruta `file`.

    *   **1.3. Actualización de Código (`src/lib/content.ts`)**:
        *   Modificar las funciones que recuperan el contenido de estas páginas (ej. `getHome`, `getPage` para las páginas genéricas de `pages_*`):
            *   Estas funciones ahora leerán desde los nuevos archivos `.yml` centralizados en lugar de los `.md` específicos de cada idioma.
            *   Deberán parsear el YAML y seleccionar los campos correctos según el `locale` recibido (ej. `data.title_en` si `locale` es `en`).

    *   **1.4. Limpieza**:
        *   Eliminar los antiguos archivos `.md` de las páginas (`content/{lang}/home.md`, `content/{lang}/about.md`, etc.).

---

#### **Verificación Final**

*   Después de cada paso significativo (especialmente al terminar cada sección de la Fase 1, y al terminar cada sub-paso de la Fase 2), ejecutar `npm run build` para asegurar que el sitio sigue construyendo correctamente.
*   Al finalizar ambas fases, se recomienda iniciar el servidor de desarrollo (`npm run dev`) y navegar por el sitio y el CMS para confirmar que toda la información se muestra correctamente y que la edición en el CMS funciona como se espera.
