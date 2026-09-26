import { checkFiles, INQUIRY_LIMITS, type FileProblem } from './limits';
import { inquirySchema } from './schema';
import { looksLikeDrawing } from './sniff-file';

export type InquiryState =
  | { status: 'idle' }
  | { status: 'sent' }
  | { status: 'error'; reason: 'invalid' | FileProblem | 'rateLimited' | 'sendFailed' };

export type Mail = {
  replyTo: string;
  subject: string;
  text: string;
  attachments: { filename: string; content: Buffer }[];
};

export type InquiryDeps = {
  now: number;
  ip: string;
  allow: (ip: string) => boolean;
  send: (mail: Mail) => Promise<void>;
};

const error = (reason: Extract<InquiryState, { status: 'error' }>['reason']): InquiryState => ({
  status: 'error',
  reason,
});

const NO_SUBJECT = '(brez zadeve)';

/**
 * Everything the inquiry action does, with the clock, the caller's address, the rate limiter and the
 * mail transport handed in. The browser has already checked all of this; none of it is trusted here.
 */
export async function handleInquiry(form: FormData, deps: InquiryDeps): Promise<InquiryState> {
  // A bot that fills the hidden field or submits instantly is told the same thing as a visitor.
  // `|| NaN` so a missing or empty start time reads as suspicious rather than as the epoch.
  const started = Number(form.get('startedAt') || NaN);
  if (form.get('website') || !Number.isFinite(started) || deps.now - started < INQUIRY_LIMITS.minFillMs)
    return { status: 'sent' };

  const parsed = inquirySchema.safeParse({
    email: form.get('email'),
    subject: form.get('subject') ?? '',
    message: form.get('message') ?? '',
    consent: form.get('consent'),
    locale: form.get('locale'),
  });
  if (!parsed.success) return error('invalid');

  const files = form.getAll('files').filter((value) => value instanceof File);
  const problem = checkFiles(files);
  if (problem) return error(problem);

  const attachments: Mail['attachments'] = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!looksLikeDrawing(file.name, bytes.subarray(0, 512))) return error('fileType');
    attachments.push({ filename: file.name, content: Buffer.from(bytes) });
  }

  if (!deps.allow(deps.ip)) return error('rateLimited');

  const { email, subject, message, locale } = parsed.data;
  const language = locale.toUpperCase();
  try {
    await deps.send({
      replyTo: email,
      subject: `Povpraševanje (${language}): ${subject || NO_SUBJECT}`,
      text: [
        message,
        '',
        `E-pošta: ${email}`,
        `Jezik: ${language}`,
        `Priloge: ${attachments.map((file) => file.filename).join(', ') || '—'}`,
      ].join('\n'),
      attachments,
    });
  } catch (failure) {
    // The form body and the drawings never reach the log: the transport's own words are enough.
    const { message: reason, code } = failure as { message?: string; code?: string };
    console.error(`inquiry: send failed: ${reason ?? 'unknown error'}${code ? ` (${code})` : ''}`);
    return error('sendFailed');
  }
  return { status: 'sent' };
}
