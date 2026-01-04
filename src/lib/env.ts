export function envVar(name: string): string | undefined {
  const im = (import.meta as any).env || {};
  const val = im[name] ?? (process.env as any)?.[name];
  if (typeof val === 'string' && val.length > 0) return val;
  return undefined;
}

// Helper for optional strict checks
export function requireEnv(names: string[]): { ok: boolean; missing: string[] } {
  const missing = names.filter((n) => !envVar(n));
  return { ok: missing.length === 0, missing };
}

export const isDev = Boolean((import.meta as any)?.env?.DEV ?? process.env.NODE_ENV === 'development');

export const GITHUB_CLIENT_ID = envVar('GITHUB_CLIENT_ID');
export const GITHUB_CLIENT_SECRET = envVar('GITHUB_CLIENT_SECRET');
export const GITHUB_OAUTH_SCOPE = envVar('GITHUB_OAUTH_SCOPE') ?? 'repo,user';
export const RESEND_API_KEY = envVar('RESEND_API_KEY');
export const EMAIL_FROM = envVar('EMAIL_FROM');
export const EMAIL_TO = envVar('EMAIL_TO');
export const EMAIL_BCC = envVar('EMAIL_BCC');

