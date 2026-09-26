import { expect, it } from 'vitest';
import { analyticsBootstrap, isMeasurementId } from './analytics-bootstrap';

it('accepts GA4 measurement ids', () => {
  expect(isMeasurementId('G-ABC123XYZ9')).toBe(true);
});

it('rejects anything that is not a GA4 measurement id', () => {
  expect(['', 'UA-1234-1', "G-1');alert(1)//"].map(isMeasurementId)).toEqual([false, false, false]);
});

it('grants analytics storage only, never advertising', () => {
  expect(analyticsBootstrap('G-ABC123')).toContain(
    "gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})",
  );
});

it('sets consent before the first hit is configured', () => {
  const script = analyticsBootstrap('G-ABC123');
  expect(script.indexOf("'consent','default'")).toBeLessThan(script.indexOf("'config'"));
});
