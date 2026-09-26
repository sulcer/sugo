'use server';

import { headers } from 'next/headers';
import { handleInquiry, type InquiryState } from '@/features/inquiry/handle-inquiry';
import { createSender } from '@/features/inquiry/mailer';
import { createInquiryLimiter } from '@/features/inquiry/rate-limit';

const allow = createInquiryLimiter();

export async function sendInquiry(_prev: InquiryState, form: FormData): Promise<InquiryState> {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return handleInquiry(form, { now: Date.now(), ip, allow, send: createSender() });
}
