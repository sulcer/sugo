'use client';

import Script from 'next/script';
import { useEffect, useSyncExternalStore } from 'react';
import { analyticsBootstrap, isMeasurementId } from './analytics-bootstrap';
import { connectAnalytics, readConsent, subscribeConsent } from './consent-store';

/** Google Analytics, loaded only after the visitor accepted cookies (never before, never on refusal). */
export function Analytics({ measurementId }: { measurementId: string }) {
  const accepted = useSyncExternalStore(
    subscribeConsent,
    () => readConsent() === 'yes',
    () => false,
  );
  // Every later choice, in this tab or another, reaches the tag through the store.
  useEffect(
    () => (isMeasurementId(measurementId) ? connectAnalytics(measurementId) : undefined),
    [measurementId],
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
