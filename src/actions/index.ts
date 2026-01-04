import { ActionError, defineAction } from 'astro:actions';
import { validateContact, sendContactEmail, type ContactInput, type Langs } from '@/lib/contact';

// Basic in-memory rate limit for Actions as well
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
type RateState = { count: number; resetAt: number };
const rateMap = new Map<string, RateState>();

export const server = {
  contact: defineAction({
    accept: 'form',
    handler: async (_data, { request }) => {
      try {
        const fwd = request.headers.get('x-forwarded-for');
        const form = await request.formData();
        const raw = Object.fromEntries(form.entries());

        const ip = fwd ? fwd.split(',')[0].trim() : (request.headers.get('x-real-ip') ?? '');
        const lang: Langs = ['en','es','fr'].includes(raw.lang as Langs) ? raw.lang as Langs : 'en';

        const data : ContactInput= {
          name: String(raw.name ?? '').trim(),
          email: String(raw.email ?? '').trim(),
          message: String(raw.message ?? '').trim(),
          company: String(raw.company ?? '').trim(),
          lang,
          ip
        };

      // Rate limit
      const now = Date.now();
      const key = ip || 'unknown';
      const state = rateMap.get(key);
      if (!state || state.resetAt < now) {
        rateMap.set(key, { count: 1, resetAt: now + WINDOW_MS });
      } else {
        if (state.count >= MAX_REQUESTS) {
          throw new ActionError({ code: 'TOO_MANY_REQUESTS', message: 'rate_limited' });
        }
        state.count++;
      }
      const errors = validateContact({ ...data });
      if (Object.keys(errors).length) {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'validation' });
      }
      
      try {
        const res = await sendContactEmail(data);
        if (!res.ok) {
          throw new ActionError({ code: 'BAD_REQUEST', message: res.error });
        }
      } catch {
        throw new ActionError({ code: 'BAD_REQUEST', message: 'email_send_failed' });
      }
      const isAjax = request.headers.get('x-requested-with') === 'fetch';
      const accepts = request.headers.get('accept') || '';
      const acceptsHtml = accepts.includes('text/html');
      if (acceptsHtml && !isAjax) {
        const location = `/${lang}/contact/success`;
        return new Response(null, { status: 303, headers: { Location: location } });
      }
      return { ok: true } as const;
      } catch {
        throw new ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'internal_error' });
      }
    }
  })
};

// (no alias export to keep API simple)
