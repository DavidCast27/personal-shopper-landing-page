// Minimal GitHub OAuth provider for Decap CMS
// Requires env vars: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

export const handler = async (event) => {
  try {
    const url = new URL(event.rawUrl)
    const pathname = url.pathname

    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return json(500, { error: 'Missing GitHub OAuth env vars' })
    }

    // Compute base origin and fixed function callback path
    const origin = `${url.protocol}//${url.host}`
    const redirectUri = `${origin}/.netlify/functions/auth/callback`

    if (pathname.endsWith('/callback')) {
      const code = url.searchParams.get('code')
      const state = url.searchParams.get('state')
      if (!code) return json(400, { error: 'Missing code' })
      // Verify CSRF state
      const cookies = parseCookies(event.headers.cookie || '')
      const expectedState = cookies['oauth_state']
      if (!state || !expectedState || state !== expectedState) {
        return json(400, { error: 'Invalid state' })
      }

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      })
      const tokenJson = await tokenRes.json()
      const accessToken = tokenJson.access_token
      if (!accessToken) {
        return html(500, `<pre>${escapeHtml(JSON.stringify(tokenJson))}</pre>`)
      }

      const script = `<!doctype html><html><body><script>
        (function(){
          function send(){
            if(window.opener){
              window.opener.postMessage({ token: '${accessToken}' }, '*');
              window.close();
            } else {
              document.body.innerText = 'Token obtained. You can close this window.';
            }
          }
          send();
        })();
      </script></body></html>`
      // Clear state cookie
      return htmlWithCookies(200, script, [cookie('oauth_state', '', { maxAge: 0 })])
    }

    // Start OAuth: redirect to GitHub authorize (scopes: adjust to repo visibility)
    const scope = 'repo,user:email'
    const state = randomState()
    const authUrl = new URL('https://github.com/login/oauth/authorize')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', scope)
    authUrl.searchParams.set('state', state)
    return redirectWithCookies(authUrl.toString(), [cookie('oauth_state', state, { httpOnly: true, sameSite: 'Lax', secure: url.protocol === 'https:' })])
  } catch (err) {
    return json(500, { error: 'Unhandled error', message: String(err) })
  }
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

function html(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
    body,
  }
}

function htmlWithCookies(statusCode, body, cookies) {
  const headers = { 'Content-Type': 'text/html; charset=utf-8' }
  if (cookies?.length) headers['Set-Cookie'] = cookies
  return { statusCode, headers, body }
}

function redirect(location) {
  return {
    statusCode: 302,
    headers: { Location: location },
  }
}

function redirectWithCookies(location, cookies) {
  const headers = { Location: location }
  if (cookies?.length) headers['Set-Cookie'] = cookies
  return { statusCode: 302, headers }
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function randomState() {
  const bytes = Array.from(crypto.getRandomValues(new Uint8Array(16)))
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function parseCookies(raw) {
  return raw.split(/;\s*/).reduce((acc, part) => {
    const idx = part.indexOf('=')
    if (idx === -1) return acc
    const k = decodeURIComponent(part.slice(0, idx))
    const v = decodeURIComponent(part.slice(idx + 1))
    acc[k] = v
    return acc
  }, /** @type {Record<string,string>} */ ({}))
}

function cookie(name, value, opts = {}) {
  const parts = [`${encodeURIComponent(name)}=${encodeURIComponent(value)}`]
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`)
  if (opts.httpOnly) parts.push('HttpOnly')
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`)
  if (opts.secure) parts.push('Secure')
  parts.push('Path=/')
  return parts.join('; ')
}
