'use client';

import Script from 'next/script';
import { useSyncExternalStore } from 'react';
import { analyticsBootstrap, isMeasurementId } from './analytics-bootstrap';
import { readConsent, subscribeConsent } from './consent-store';

/** Google Analytics, loaded only after the visitor accepted cookies (never before, never on refusal). */
export function Analytics({ measurementId }: { measurementId: string }) {
  const accepted = useSyncExternalStore(
    subscribeConsent,
    () => readConsent() === 'yes',
    () => false,
  );
  if (!accepted || !isMeasurementId(measurementId)) return null;
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
