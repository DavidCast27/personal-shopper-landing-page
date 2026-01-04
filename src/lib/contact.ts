import { Resend } from 'resend';
import { RESEND_API_KEY, EMAIL_FROM, EMAIL_TO, EMAIL_BCC } from '@/lib/env';

export type Langs = 'en' | 'es' | 'fr';
export type ContactInput = {
  name: string;
  email: string;
  message: string;
  company: string; // honeypot
  lang: Langs;
  ip: string;
};

export function validateContact(input: ContactInput) {
  const errors: Record<string, string> = {};
  const name = (input.name || '').trim();
  const email = (input.email || '').trim();
  const message = (input.message || '').trim();
  const company = (input.company || '').trim();

  if (company) errors.company = 'bot_detected';
  if (name.length < 2 || name.length > 80) errors.name = 'name_length';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = 'email_invalid';
  if (message.length < 10 || message.length > 2000) errors.message = 'message_length';

  return errors;
}

function escapeHtml(str: string) {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const resendClient = (() => {
  return RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
})();

export async function sendContactEmail(input: Required<ContactInput>) {
  if (!resendClient || !EMAIL_FROM || !EMAIL_TO) {
    return { ok: false as const, error: 'server_misconfigured' };
  }
  const toList = EMAIL_TO.split(',').map((s) => s.trim()).filter(Boolean);
  const bccList = (EMAIL_BCC || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const lang = input.lang || 'en';
  const subject = `[Contact][${lang}] ${input.name}`;
  const text = `New contact form submission\n\nName: ${input.name}\nEmail: ${input.email}\nLanguage: ${lang}\nIP: ${input.ip || ''}\n\nMessage:\n${input.message}`;
  const html = `
    <div>
      <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Language:</strong> ${lang}</p>
      ${input.ip ? `<p><strong>IP:</strong> ${escapeHtml(input.ip)}</p>` : ''}
      <hr />
      <p><strong>Message:</strong></p>
      <pre style="white-space:pre-wrap;word-wrap:break-word;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(input.message)}</pre>
    </div>
  `;

  try {
    const result = await resendClient.emails.send({
      from: EMAIL_FROM,
      to: toList,
      ...(bccList.length ? { bcc: bccList } : {}),
      subject,
      text,
      html,
      reply_to: input.email,
    } as any);

    if ((result as any)?.error) {
      return { ok: false as const, error: 'email_send_failed' };
    }
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: 'email_send_failed' };
  }
}
