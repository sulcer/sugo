import { z } from 'zod';
import { LOCALES } from '@/i18n/locales';
import { INQUIRY_LIMITS } from './limits';

/** A browser sends every line break as CRLF; the limit the visitor was shown counts it as one. */
const text = (max: number) =>
  z.preprocess(
    (value) => (typeof value === 'string' ? value.replaceAll('\r\n', '\n') : value),
    z.string().trim().max(max),
  );

export const inquirySchema = z.object({
  email: z.email(),
  // The subject becomes a mail header: a line break in it would let a visitor add headers of their own.
  subject: text(INQUIRY_LIMITS.subjectMax).transform((subject) => subject.replace(/[\r\n]+/g, ' ')),
  message: text(INQUIRY_LIMITS.messageMax),
  consent: z.literal('on'),
  locale: z.enum(LOCALES),
});
