export const isMeasurementId = (id: string) => /^G-[A-Z0-9]+$/.test(id);

/**
 * gtag bootstrap, run only after the visitor accepted analytics cookies: analytics storage granted,
 * advertising storage and signals always denied (Consent Mode v2).
 */
export const analyticsBootstrap = (measurementId: string) =>
  [
    'window.dataLayer=window.dataLayer||[];',
    'function gtag(){dataLayer.push(arguments);}',
    'window.gtag=gtag;',
    "gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});",
    "gtag('js',new Date());",
    `gtag('config','${measurementId}');`,
  ].join('');
