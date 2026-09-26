import nodemailer from 'nodemailer';
import { COMPANY } from '@/content/company';
import type { Mail } from './handle-inquiry';

/** `MAIL_TRANSPORT=json` turns the mail into a JSON string instead of sending it, for test runs. */
function createTransport() {
  if (process.env.MAIL_TRANSPORT === 'json') return nodemailer.createTransport({ jsonTransport: true });
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
