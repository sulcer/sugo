// @vitest-environment node
import nodemailer from 'nodemailer';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSender } from './mailer';

const mail = {
  replyTo: 'ana@primer.si',
  subject: 'Povpraševanje (SL): Ohišje senzorja',
  text: 'Prosim za ponudbo.',
  attachments: [{ filename: 'risba.pdf', content: Buffer.from('%PDF-1.7') }],
};

function captureTransport() {
  const sendMail = vi.fn().mockResolvedValue({});
  vi.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail } as never);
  return sendMail;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('createSender', () => {
  it('sends from our own account and answers to the visitor', async () => {
    vi.stubEnv('EMAIL', 'posta@sugo.si');
    vi.stubEnv('EMAIL_PASS', 'app-password');
    const sendMail = captureTransport();
    await createSender()(mail);
    expect(sendMail.mock.calls).toEqual([
      [{ from: '"SUGO spletna stran" <posta@sugo.si>', to: 'posta@sugo.si', ...mail }],
    ]);
  });

  it('refuses to send when the mail account is not configured', async () => {
    vi.stubEnv('MAIL_TRANSPORT', '');
    vi.stubEnv('EMAIL', '');
    vi.stubEnv('EMAIL_PASS', '');
    await expect(createSender()(mail)).rejects.toThrow(/EMAIL/);
  });

  it('refuses to swallow a production inquiry into JSON', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('MAIL_TRANSPORT', 'json');
    vi.stubEnv('EMAIL', '');
    vi.stubEnv('EMAIL_PASS', '');
    await expect(createSender()(mail)).rejects.toThrow(/EMAIL/);
  });

  it('really sends in production however the transport is set', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('MAIL_TRANSPORT', 'json');
    vi.stubEnv('EMAIL', 'posta@sugo.si');
    vi.stubEnv('EMAIL_PASS', 'app-password');
    const sendMail = captureTransport();
    await createSender()(mail);
    expect(sendMail).toHaveBeenCalledTimes(1);
  });

  it('swallows the mail into JSON when the transport is stubbed', async () => {
    vi.stubEnv('MAIL_TRANSPORT', 'json');
    vi.stubEnv('EMAIL', '');
    vi.stubEnv('EMAIL_PASS', '');
    await expect(createSender()(mail)).resolves.toBeUndefined();
  });
});
