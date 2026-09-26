import { CONSENT_KEY } from './consent-store';

export const isMeasurementId = (id: string) => /^G-[A-Z0-9]+$/.test(id);

/**
 * Consent Mode v2 bootstrap: everything denied by default, analytics granted only if the visitor
 * accepted on an earlier visit. Must run before gtag.js processes the queue.
 */
export const analyticsBootstrap = (measurementId: string) =>
  [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    'window.gtag=gtag;',
    "gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});",
    `try{if(localStorage.getItem('${CONSENT_KEY}')==='yes')gtag('consent','update',{analytics_storage:'granted'});}catch(e){}`,
    "gtag('js',new Date());",
    `gtag('config','${measurementId}');`,
  ].join('');
