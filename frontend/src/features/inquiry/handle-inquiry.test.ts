// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleInquiry, type InquiryDeps, type Mail } from './handle-inquiry';

const PDF = '%PDF-1.7\nrisba';
const STEP = 'ISO-10303-21;\nHEADER;';
const MESSAGE = 'Prosim za ponudbo za 50 kosov.';

const drawing = (name: string, body: string) => new File([body], name);

function formOf(fields: Record<string, string> = {}, files: File[] = []) {
  const form = new FormData();
  const values = {
    email: 'ana@primer.si',
    subject: 'Ohišje senzorja',
    message: MESSAGE,
    consent: 'on',
    locale: 'sl',
    website: '',
    startedAt: '0',
    ...fields,
  };
  for (const [name, value] of Object.entries(values)) form.set(name, value);
  for (const file of files) form.append('files', file);
  return form;
}

let send: ReturnType<typeof vi.fn<(mail: Mail) => Promise<void>>>;
let deps: InquiryDeps;

beforeEach(() => {
  send = vi.fn<(mail: Mail) => Promise<void>>().mockResolvedValue(undefined);
  deps = { now: 10_000, ip: '1.2.3.4', allow: () => true, send };
});

describe('handleInquiry', () => {
  it('reports a complete inquiry as sent', async () => {
    expect(await handleInquiry(formOf(), deps)).toEqual({ status: 'sent' });
  });

  it('hands the mailer the visitor as reply-to, the message and both drawings', async () => {
    await handleInquiry(formOf({}, [drawing('risba.pdf', PDF), drawing('model.step', STEP)]), deps);
    expect(send.mock.calls).toEqual([
      [
        {
          replyTo: 'ana@primer.si',
          subject: 'Povpraševanje (SL): Ohišje senzorja',
          text: `${MESSAGE}\n\nE-pošta: ana@primer.si\nJezik: SL\nPriloge: risba.pdf, model.step`,
          attachments: [
            { filename: 'risba.pdf', content: Buffer.from(PDF) },
            { filename: 'model.step', content: Buffer.from(STEP) },
          ],
        },
      ],
    ]);
  });

  it('names an inquiry without a subject', async () => {
    await handleInquiry(formOf({ subject: '' }), deps);
    expect(send.mock.calls[0]?.[0].subject).toBe('Povpraševanje (SL): (brez zadeve)');
  });

  it('answers a filled honeypot exactly as it answers a visitor', async () => {
    expect(await handleInquiry(formOf({ website: 'https://spam.test' }), deps)).toEqual({
      status: 'sent',
    });
  });

  it('sends nothing when the honeypot is filled', async () => {
    await handleInquiry(formOf({ website: 'https://spam.test' }), deps);
    expect(send).not.toHaveBeenCalled();
  });

  it('sends nothing when the form was filled in a second', async () => {
    await handleInquiry(formOf({ startedAt: '9000' }), deps);
    expect(send).not.toHaveBeenCalled();
  });

  it('sends nothing when the form has no start time', async () => {
    const form = formOf();
    form.delete('startedAt');
    await handleInquiry(form, deps);
    expect(send).not.toHaveBeenCalled();
  });

  it('rejects an address that is not an e-mail', async () => {
    expect(await handleInquiry(formOf({ email: 'not-an-email' }), deps)).toEqual({
      status: 'error',
      reason: 'invalid',
    });
  });

  it('rejects a submission without consent', async () => {
    expect(await handleInquiry(formOf({ consent: '' }), deps)).toEqual({
      status: 'error',
      reason: 'invalid',
    });
  });

  it('rejects an executable', async () => {
    expect(await handleInquiry(formOf({}, [drawing('a.exe', 'MZ')]), deps)).toEqual({
      status: 'error',
      reason: 'fileType',
    });
  });

  it('rejects an executable renamed to a drawing', async () => {
    expect(await handleInquiry(formOf({}, [drawing('risba.pdf', 'MZ\u0000\u0000')]), deps)).toEqual({
      status: 'error',
      reason: 'fileType',
    });
  });

  it('rejects drawings over the total size', async () => {
    const big = new File([PDF + 'x'.repeat(4 * 1024 * 1024)], 'risba.pdf');
    expect(await handleInquiry(formOf({}, [big]), deps)).toEqual({
      status: 'error',
      reason: 'tooLarge',
    });
  });

  it('rejects an address that has run out of attempts', async () => {
    expect(await handleInquiry(formOf(), { ...deps, allow: () => false })).toEqual({
      status: 'error',
      reason: 'rateLimited',
    });
  });

  it('reports a failed delivery', async () => {
    send.mockRejectedValue(new Error('smtp gateway down'));
    expect(await handleInquiry(formOf(), deps)).toEqual({ status: 'error', reason: 'sendFailed' });
  });

  it('logs a failed delivery without the visitor message', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    send.mockRejectedValue(new Error('smtp gateway down'));
    await handleInquiry(formOf(), deps);
    const logged = error.mock.calls.flat().join(' ');
    error.mockRestore();
    expect([logged.includes('smtp gateway down'), logged.includes(MESSAGE)]).toEqual([true, false]);
  });
});
