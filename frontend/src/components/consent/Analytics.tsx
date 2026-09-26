import Script from 'next/script';
import { analyticsBootstrap, isMeasurementId } from './analytics-bootstrap';

/** Google Analytics behind Consent Mode; renders nothing without a valid measurement id. */
export function Analytics() {
  const measurementId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS ?? '';
  if (!isMeasurementId(measurementId)) return null;
  return (
    <>
      <Script id="analytics-consent" strategy="afterInteractive">
        {analyticsBootstrap(measurementId)}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
    </>
  );
}
