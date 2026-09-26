import nodemailer from 'nodemailer';
import { COMPANY } from '@/content/company';
import type { Mail } from './handle-inquiry';

/**
 * `MAIL_TRANSPORT=json` turns the mail into a JSON string instead of sending it, for test runs. In
 * production it is ignored: a stray environment variable must not quietly bin every inquiry.
 */
function createTransport() {
  if (process.env.MAIL_TRANSPORT === 'json') {
    if (process.env.VERCEL_ENV !== 'production') return nodemailer.createTransport({ jsonTransport: true });
    console.error('mailer: MAIL_TRANSPORT=json ignored in production');
  }
  const user = process.env.EMAIL;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) throw new Error('EMAIL and EMAIL_PASS must be set to send inquiries');
  return nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
}

/**
 * The mail always comes from our own account — a visitor's address in `from` is a forgery that
 * fails SPF and lands in spam. The visitor is reachable through `replyTo`.
 */
export function createSender(): (mail: Mail) => Promise<void> {
  return async (mail) => {
    const transport = createTransport();
    const account = process.env.EMAIL || COMPANY.email;
    await transport.sendMail({ from: `"SUGO spletna stran" <${account}>`, to: account, ...mail });
  };
}
