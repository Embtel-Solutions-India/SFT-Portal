import nodemailer from 'nodemailer';

const FROM = process.env.MAIL_FROM || 'info@schoolfortraining.com';
const FROM_NAME = process.env.MAIL_FROM_NAME || 'School For Training';
const BREVO_KEY = process.env.BREVO_API_KEY; // preferred: Brevo transactional API (xkeysib-...)

const transport = !BREVO_KEY && process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for STARTTLS on 587
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined
    })
  : null;

export const APP_URL = (process.env.APP_URL || 'http://localhost:5173').replace(/\/$/, '');
export const mailConfigured = () => !!(BREVO_KEY || transport);

async function sendViaBrevo(to: string, subject: string, text: string) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO_KEY!, 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: { email: FROM, name: FROM_NAME }, to: [{ email: to }], subject, textContent: text }),
    signal: AbortSignal.timeout(15_000)
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 200)}`);
}

/** Send an email. Without a provider configured (dev), logs it instead. Never throws — mail failure must not break the request. */
export async function sendMail(to: string, subject: string, text: string): Promise<boolean> {
  if (!mailConfigured()) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`[Mail] No mail provider configured; dropped "${subject}" to ${to}`);
      return false;
    }
    console.log(`\n[Mail:dev] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return true;
  }
  try {
    if (BREVO_KEY) await sendViaBrevo(to, subject, text);
    else await transport!.sendMail({ from: { address: FROM, name: FROM_NAME }, to, subject, text });
    return true;
  } catch (err: any) {
    console.error(`[Mail] Failed to send "${subject}" to ${to}:`, err.message);
    return false;
  }
}

export async function verifyMailer() {
  try {
    if (BREVO_KEY) {
      const res = await fetch('https://api.brevo.com/v3/account', { headers: { 'api-key': BREVO_KEY, accept: 'application/json' } });
      if (!res.ok) throw new Error(`Brevo key rejected (${res.status})`);
      return console.log(`[Mail] Brevo API ready, sending as ${FROM}`);
    }
    if (!transport) return console.log('[Mail] No mail provider configured — emails are logged to console.');
    await transport.verify();
    console.log(`[Mail] SMTP ready (${process.env.SMTP_HOST}), sending as ${FROM}`);
  } catch (err: any) {
    console.error('[Mail] Verification failed:', err.message);
  }
}
