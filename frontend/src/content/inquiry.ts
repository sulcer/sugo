import type { Localized } from '@/i18n/locales';

export const INQUIRY: Localized<{
  drop: string;
  pick: string;
  formats: string;
  email: string;
  subject: string;
  message: string;
  consentBefore: string;
  consentLink: string;
  consentAfter: string;
  send: string;
  sending: string;
  sent: string;
  again: string;
  remove: string;
  direct: string;
  phone: string;
  mail: string;
  errors: {
    email: string;
    consent: string;
    fileType: string;
    tooMany: string;
    tooLarge: string;
    rateLimited: string;
    sendFailed: string;
  };
}> = {
  sl: {
    drop: 'Povlecite risbo sem',
    pick: 'ali izberite datoteko',
    formats: 'PDF · STEP · DXF',
    email: 'E-pošta',
    subject: 'Zadeva',
    message: 'Sporočilo',
    consentBefore: 'Izjavljam, da sem seznanjen z vsebino ',
    consentLink: 'Izjave o varovanju osebnih podatkov',
    consentAfter: '.',
    send: 'Pošlji',
    sending: 'Pošiljanje …',
    sent: 'Hvala. Povpraševanje je poslano.',
    again: 'Novo povpraševanje',
    remove: 'Odstrani',
    direct: 'Neposredni kontakt',
    phone: 'Telefon',
    mail: 'E-pošta',
    errors: {
      email: 'Vpišite e-poštni naslov.',
      consent: 'Potrdite izjavo o varovanju podatkov.',
      fileType: 'Podprte so datoteke PDF, STEP in DXF.',
      tooMany: 'Priložite največ 5 datotek.',
      tooLarge: 'Datoteke skupaj presegajo 4 MB — pošljite jih na cncgolob@gmail.com.',
      rateLimited: 'Preveč poskusov. Poskusite čez nekaj minut ali pišite na cncgolob@gmail.com.',
      sendFailed: 'Pošiljanje ni uspelo. Pišite na cncgolob@gmail.com ali pokličite +386 31 876 138.',
    },
  },
  de: {
    drop: 'Zeichnung hierher ziehen',
    pick: 'oder Datei auswählen',
    formats: 'PDF · STEP · DXF',
    email: 'E-Mail',
    subject: 'Betreff',
    message: 'Nachricht',
    consentBefore: 'Ich habe die ',
    consentLink: 'Datenschutzerklärung',
    consentAfter: ' gelesen und stimme der Verarbeitung meiner Daten zu.',
    send: 'Senden',
    sending: 'Wird gesendet …',
    sent: 'Vielen Dank. Ihre Anfrage wurde gesendet.',
    again: 'Neue Anfrage',
    remove: 'Entfernen',
    direct: 'Direkter Kontakt',
    phone: 'Telefon',
    mail: 'E-Mail',
    errors: {
      email: 'Bitte E-Mail-Adresse eingeben.',
      consent: 'Bitte Datenschutzerklärung bestätigen.',
      fileType: 'Unterstützt werden PDF-, STEP- und DXF-Dateien.',
      tooMany: 'Bitte höchstens 5 Dateien anhängen.',
      tooLarge: 'Die Dateien überschreiten zusammen 4 MB — senden Sie sie an cncgolob@gmail.com.',
      rateLimited:
        'Zu viele Versuche. Versuchen Sie es in einigen Minuten erneut oder schreiben Sie an cncgolob@gmail.com.',
      sendFailed:
        'Senden fehlgeschlagen. Schreiben Sie an cncgolob@gmail.com oder rufen Sie +386 31 876 138 an.',
    },
  },
  en: {
    drop: 'Drop your drawing here',
    pick: 'or choose a file',
    formats: 'PDF · STEP · DXF',
    email: 'E-mail',
    subject: 'Subject',
    message: 'Message',
    consentBefore: 'I have read the ',
    consentLink: 'Privacy policy',
    consentAfter: ' and agree to the processing of my data.',
    send: 'Send',
    sending: 'Sending …',
    sent: 'Thank you. Your enquiry has been sent.',
    again: 'New enquiry',
    remove: 'Remove',
    direct: 'Direct contact',
    phone: 'Phone',
    mail: 'E-mail',
    errors: {
      email: 'Please enter your e-mail address.',
      consent: 'Please confirm the privacy policy.',
      fileType: 'PDF, STEP and DXF files are supported.',
      tooMany: 'Please attach at most 5 files.',
      tooLarge: 'The files exceed 4 MB in total — send them to cncgolob@gmail.com.',
      rateLimited: 'Too many attempts. Try again in a few minutes or write to cncgolob@gmail.com.',
      sendFailed: 'Sending failed. Write to cncgolob@gmail.com or call +386 31 876 138.',
    },
  },
};
