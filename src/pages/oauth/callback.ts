export const prerender = false;
import type { APIRoute } from 'astro';
import { OAUTH_GITHUB_CLIENT_ID, OAUTH_GITHUB_CLIENT_SECRET } from 'astro:env/server';

const tokenUrl = 'https://github.com/login/oauth/access_token';

function envVar(name: string): string | undefined {
  const im = (import.meta as any).env || {};
  return im[name] || (process.env as any)[name];
}

export const GET: APIRoute = async ({ url, redirect }) => {
  const client_id = OAUTH_GITHUB_CLIENT_ID || envVar('GITHUB_CLIENT_ID');
  const client_secret = OAUTH_GITHUB_CLIENT_SECRET || envVar('GITHUB_CLIENT_SECRET');
  const code = url.searchParams.get('code');

  if (!client_id || !client_secret || !code) {
    return redirect('/?error=missing_oauth_params');
  }

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, client_id, client_secret }),
    });

    if (!response.ok) {
      return redirect('/?error=token_exchange_failed');
    }

    const body = (await response.json()) as { access_token?: string };
    const token = body.access_token || '';
    if (!token) return redirect('/?error=no_token');

    const content = { token, provider: 'github' };
    const script = `
      <script>
        const receiveMessage = (message) => {
          window.opener.postMessage(
            'authorization:${content.provider}:success:${JSON.stringify(content)}',
            message.origin
          );
          window.removeEventListener('message', receiveMessage, false);
        }
        window.addEventListener('message', receiveMessage, false);
        window.opener.postMessage('authorizing:${content.provider}', '*');
      </script>
    `;

    return new Response(script, { headers: { 'Content-Type': 'text/html' } });
  } catch (err) {
    return redirect('/?error=oauth_exception');
  }
};

