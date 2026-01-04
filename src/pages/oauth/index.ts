export const prerender = false;
import type { APIRoute } from 'astro';
import { GITHUB_CLIENT_ID, GITHUB_OAUTH_SCOPE } from '@/lib/env';

export const GET: APIRoute = ({ redirect }) => {
  const clientId = GITHUB_CLIENT_ID || '';
  const scope = GITHUB_OAUTH_SCOPE || 'repo,user';
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(scope)}`;
  return redirect(authUrl);
};
