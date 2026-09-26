import { INQUIRY_LIMITS } from '@/features/inquiry/limits';
import type { Localized } from '@/i18n/locales';
import { COMPANY } from './company';

const MAX_MB = INQUIRY_LIMITS.maxTotalBytes / (1024 * 1024);
const PHONE = COMPANY.phones[0].display;

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
    invalid: string;
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
      invalid: 'Preverite vnose in poskusite znova.',
      fileType: 'Podprte so datoteke PDF, STEP in DXF.',
      tooMany: `Priložite največ ${INQUIRY_LIMITS.maxFiles} datotek.`,
      tooLarge: `Datoteke skupaj presegajo ${MAX_MB} MB — pošljite jih na ${COMPANY.email}.`,
      rateLimited: `Preveč poskusov. Poskusite čez nekaj minut ali pišite na ${COMPANY.email}.`,
      sendFailed: `Pošiljanje ni uspelo. Pišite na ${COMPANY.email} ali pokličite ${PHONE}.`,
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
      invalid: 'Bitte prüfen Sie Ihre Eingaben und versuchen Sie es erneut.',
      fileType: 'Unterstützt werden PDF-, STEP- und DXF-Dateien.',
      tooMany: `Bitte höchstens ${INQUIRY_LIMITS.maxFiles} Dateien anhängen.`,
      tooLarge: `Die Dateien überschreiten zusammen ${MAX_MB} MB — senden Sie sie an ${COMPANY.email}.`,
      rateLimited: `Zu viele Versuche. Versuchen Sie es in einigen Minuten erneut oder schreiben Sie an ${COMPANY.email}.`,
      sendFailed: `Senden fehlgeschlagen. Schreiben Sie an ${COMPANY.email} oder rufen Sie ${PHONE} an.`,
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
      invalid: 'Please check your entries and try again.',
      fileType: 'PDF, STEP and DXF files are supported.',
      tooMany: `Please attach at most ${INQUIRY_LIMITS.maxFiles} files.`,
      tooLarge: `The files exceed ${MAX_MB} MB in total — send them to ${COMPANY.email}.`,
      rateLimited: `Too many attempts. Try again in a few minutes or write to ${COMPANY.email}.`,
      sendFailed: `Sending failed. Write to ${COMPANY.email} or call ${PHONE}.`,
    },
  },
};
