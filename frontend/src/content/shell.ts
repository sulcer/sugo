import type { Localized } from '@/i18n/locales';
import type { RouteKey } from '@/i18n/routes';

type SheetRoute = Exclude<RouteKey, 'home' | 'privacy'>;

export const NAVIGATION: Localized<{
  names: Record<RouteKey, string>;
  descriptions: Record<SheetRoute, string>;
  menu: string;
  close: string;
  language: string;
  currentSheet: string;
  skipToContent: string;
}> = {
  sl: {
    names: {
      home: 'Domov',
      park: 'Strojni park',
      products: 'Izdelki',
      contact: 'Kontakt',
      privacy: 'Zasebnost',
    },
    descriptions: {
      park: 'Šest CNC strojev z delovnimi prostori',
      products: 'Risbe delov, izdelanih pri SUGO',
      contact: 'Pošljite risbo · podatki · lokacija',
    },
    menu: 'Meni',
    close: 'Zapri',
    language: 'Jezik',
    currentSheet: 'Trenutni list',
    skipToContent: 'Na vsebino',
  },
  de: {
    names: {
      home: 'Startseite',
      park: 'Maschinenpark',
      products: 'Produkte',
      contact: 'Kontakt',
      privacy: 'Datenschutz',
    },
    descriptions: {
      park: 'Sechs CNC-Maschinen mit Arbeitsräumen',
      products: 'Zeichnungen von Teilen aus der SUGO-Fertigung',
      contact: 'Zeichnung senden · Daten · Anfahrt',
    },
    menu: 'Menü',
    close: 'Schließen',
    language: 'Sprache',
    currentSheet: 'Aktuelles Blatt',
    skipToContent: 'Zum Inhalt',
  },
  en: {
    names: {
      home: 'Home',
      park: 'Machine park',
      products: 'Products',
      contact: 'Contact',
      privacy: 'Privacy',
    },
    descriptions: {
      park: 'Six CNC machines with work envelopes',
      products: 'Drawings of parts made at SUGO',
      contact: 'Send a drawing · details · location',
    },
    menu: 'Menu',
    close: 'Close',
    language: 'Language',
    currentSheet: 'Current sheet',
    skipToContent: 'Skip to content',
  },
};

export const FOOTER: Localized<{
  address: string;
  contact: string;
  taxNumber: string;
  registrationNumber: string;
  privacy: string;
  cookies: string;
  rights: string;
}> = {
  sl: {
    address: 'Naslov',
    contact: 'Kontakt',
    taxNumber: 'Davčna številka',
    registrationNumber: 'Matična številka',
    privacy: 'Varovanje osebnih podatkov',
    cookies: 'Nastavitve piškotkov',
    rights: 'Vse pravice pridržane.',
  },
  de: {
    address: 'Adresse',
    contact: 'Kontakt',
    taxNumber: 'Steuernummer',
    registrationNumber: 'Registernummer',
    privacy: 'Datenschutzerklärung',
    cookies: 'Cookie-Einstellungen',
    rights: 'Alle Rechte vorbehalten.',
  },
  en: {
    address: 'Address',
    contact: 'Contact',
    taxNumber: 'Tax number',
    registrationNumber: 'Registration number',
    privacy: 'Privacy policy',
    cookies: 'Cookie settings',
    rights: 'All rights reserved.',
  },
};

export const COOKIE_NOTICE: Localized<{
  label: string;
  text: string;
  more: string;
  accept: string;
  decline: string;
}> = {
  sl: {
    label: 'Piškotki',
    text: 'Spletna stran uporablja piškotke za analizo obiska (Google Analytics).',
    more: 'Več informacij',
    accept: 'Se strinjam',
    decline: 'Zavrni',
  },
  de: {
    label: 'Cookies',
    text: 'Diese Website verwendet Cookies zur Besucheranalyse (Google Analytics).',
    more: 'Mehr erfahren',
    accept: 'Zustimmen',
    decline: 'Ablehnen',
  },
  en: {
    label: 'Cookies',
    text: 'This site uses cookies to analyse visits (Google Analytics).',
    more: 'More information',
    accept: 'Accept',
    decline: 'Decline',
  },
};

export const NOT_FOUND: Localized<{ title: string; back: string; sheet: string }> = {
  sl: { title: 'List ne obstaja', back: 'Nazaj na domačo stran', sheet: 'List —' },
  de: { title: 'Dieses Blatt gibt es nicht', back: 'Zurück zur Startseite', sheet: 'Blatt —' },
  en: { title: 'This sheet does not exist', back: 'Back to the home page', sheet: 'Sheet —' },
};
