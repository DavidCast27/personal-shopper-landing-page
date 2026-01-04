/// <reference types="astro/client" />
/// <reference types="astro/actions" />

interface ImportMetaEnv {
  readonly GITHUB_CLIENT_ID?: string;
  readonly GITHUB_CLIENT_SECRET?: string;
  readonly GITHUB_OAUTH_SCOPE?: string;

  readonly RESEND_API_KEY?: string;
  readonly EMAIL_FROM?: string;
  readonly EMAIL_TO?: string;
  readonly EMAIL_BCC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
