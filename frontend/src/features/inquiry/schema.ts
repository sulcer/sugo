import { z } from 'zod';
import { LOCALES } from '@/i18n/locales';
import { INQUIRY_LIMITS } from './limits';

export const inquirySchema = z.object({
  email: z.email(),
  // The subject becomes a mail header: CR / LF in it would let a visitor add headers of their own.
  subject: z
    .string()
    .trim()
    .max(INQUIRY_LIMITS.subjectMax)
    .transform((subject) => subject.replace(/[\r\n]+/g, ' ')),
  message: z.string().trim().max(INQUIRY_LIMITS.messageMax),
  consent: z.literal('on'),
  locale: z.enum(LOCALES),
});
