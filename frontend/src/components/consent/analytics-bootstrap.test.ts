import { expect, it } from 'vitest';
import { analyticsBootstrap, isMeasurementId } from './analytics-bootstrap';

it('accepts GA4 measurement ids', () => {
  expect(isMeasurementId('G-ABC123XYZ9')).toBe(true);
});

it('rejects anything that is not a GA4 measurement id', () => {
  expect(['', 'UA-1234-1', "G-1');alert(1)//"].map(isMeasurementId)).toEqual([false, false, false]);
});

it('denies every storage type before analytics is configured', () => {
  const script = analyticsBootstrap('G-ABC123');
  expect(script.indexOf("'consent','default'")).toBeLessThan(script.indexOf("'config'"));
});

it('denies ad storage and personalisation by default', () => {
  expect(analyticsBootstrap('G-ABC123')).toContain(
    "gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})",
  );
});

it('restores an earlier acceptance before the first hit', () => {
  const script = analyticsBootstrap('G-ABC123');
  expect(script.indexOf("localStorage.getItem('sugo-cookie')")).toBeLessThan(script.indexOf("'config'"));
});
