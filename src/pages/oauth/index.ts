export const prerender = false;
import type { APIRoute } from 'astro';
import { OAUTH_GITHUB_CLIENT_ID } from 'astro:env/server';

function getClientId() {
  return (
    OAUTH_GITHUB_CLIENT_ID || (import.meta as any).env?.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID || ''
  );
}

export const GET: APIRoute = ({ url, redirect }) => {
  const clientId = getClientId();
  const scope = ((import.meta as any).env?.GITHUB_OAUTH_SCOPE || process.env.GITHUB_OAUTH_SCOPE || 'repo,user');
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scope)}`;
  return redirect(authUrl);
};

