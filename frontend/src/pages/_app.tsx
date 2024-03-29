import '@/styles/globals.css';
import { LayoutProvider } from '@/components';
import { AppProps } from 'next/app';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Head from 'next/head';
import GoogleAnalytics from '@/components/CookieBanner/GoogleAnalytics';
import CookieConsentBanner from '@/components/CookieBanner/CookieConsentBanner';
import { appWithTranslation } from 'next-i18next';

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>SUGO d.o.o</title>
      </Head>
      <GoogleReCaptchaProvider
        reCaptchaKey={process.env.NEXT_PUBLIC_SITE_KEY as string}
      >
        <CookieConsentBanner />
        <GoogleAnalytics
          GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS as string}
        />
        <LayoutProvider>
          <Component {...pageProps} />
        </LayoutProvider>
      </GoogleReCaptchaProvider>
    </>
  );
}

export default appWithTranslation(App);
