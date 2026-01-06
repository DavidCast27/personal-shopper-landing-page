# Project Overview

This is a multilingual landing page template built with [Astro](https://astro.build/). It's designed to be a static-first site, with content managed through [Decap CMS](https://decapcms.org/) (formerly Netlify CMS). The project is configured for English, Spanish, and French, with a clear i18n routing structure.

## Key Technologies

*   **Framework**: Astro
*   **Styling**: Tailwind CSS
*   **CMS**: Decap CMS (Git-based)
*   **Deployment**: Astro's built-in Node.js adapter for server-side rendering (SSR) to support Astro Actions.
*   **Contact Form**: Powered by Astro Actions and Resend for email delivery.

## Building and Running

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    The site will be available at `http://localhost:4321`.

3.  **Build for Production**:
    ```bash
    npm run build
    ```

4.  **Preview Production Build**:
    ```bash
    npm run preview
    ```

## Development Conventions

### Project Structure

*   `src/pages`: Contains the pages for the site. Each file represents a route. The i18n is handled through subdirectories (`en`, `es`, `fr`).
*   `src/components`: Reusable Astro components.
*   `src/layouts`: Main site layout component.
*   `content`: Contains the markdown files for the site content, organized by language. This is the content that Decap CMS edits.
*   `public/admin`: Decap CMS configuration (`config.yml`).

### Content Management

*   Content is managed in Markdown files within the `content` directory.
*   Decap CMS is configured in `public/admin/config.yml`. It uses GitHub for authentication and saves content directly to the repository.
*   To access the CMS, navigate to `/admin` on the running site.

### Internationalization (i1axn)

*   The site supports three languages: English (`en`), Spanish (`es`), and French (`fr`).
*   Routes are prefixed with the language code (e.g., `/en/about`, `/es/about`).
*   The root path (`/`) redirects to the user's preferred language based on browser settings or a cookie.
*   Content for each language is stored in its own subdirectory within `content`.

## Additional Context

For more detailed information about the project, refer to the `README.md` file.