import { SheetMain } from '@/components/SheetMain';
import { SheetSection } from '@/components/SheetSection';
import { CONTACT } from '@/content/contact';
import { DirectContact } from '@/features/contact/DirectContact';
import { Faq } from '@/features/contact/Faq';
import { InquiryForm } from '@/features/contact/InquiryForm';
import { Location } from '@/features/contact/Location';
import { isLocale } from '@/i18n/locales';
import { metadataFor } from '@/i18n/metadata';
import { localePath } from '@/i18n/routes';
import { sendInquiry } from './send-inquiry';

export const generateMetadata = metadataFor('contact');

export default async function ContactPage({ params }: PageProps<'/[locale]/kontakt'>) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const copy = CONTACT[locale];

  return (
    <SheetMain>
      {/* The home page's call to action lands here; `scroll-padding-top` keeps it below the header. */}
      <SheetSection id="risba" number="01" divider={false} grid>
        <div className="flex min-w-0 flex-[1_1_600px] flex-col gap-8 px-4 pt-[clamp(8px,4cqw,64px)] pr-gutter pb-[clamp(48px,5cqw,72px)]">
          <div className="flex max-w-[44em] flex-col gap-4">
            <h1 className="m-0 text-page font-medium">{copy.title}</h1>
            <p className="m-0 text-lead text-grey">{copy.lead}</p>
          </div>
          <div className="flex flex-wrap gap-[clamp(32px,4vw,64px)]">
            <InquiryForm locale={locale} privacyHref={localePath(locale, 'privacy')} action={sendInquiry} />
            <DirectContact locale={locale} />
          </div>
        </div>
      </SheetSection>
      <Location locale={locale} />
      <Faq locale={locale} />
    </SheetMain>
  );
}
