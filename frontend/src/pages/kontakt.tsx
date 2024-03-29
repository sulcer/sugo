import React, { FC } from 'react';
import { ContactForm } from '@/components';
import Head from 'next/head';
import { getContact } from '@/lib/api';
import FaqAccordion from '@/components/FaqAccordion/FaqAccordion';
import {useTranslation} from "next-i18next";
import {Locale} from "@/types/types";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

interface ContactInfoProps {
  contact: {
    name: string;
    email: string;
    phone: string;
    address: string;
    taxNumber: string;
    representative: string;
    registrationNumber: string;
  };
}

const Map = () => {
  return (
    <iframe
      className={'w-full'}
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2740.5070340179773!2d15.748219115664767!3d46.616744363819905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476f738e7a0cbedf%3A0x7766bd6edfa8d439!2sSpodnji%20Jakobski%20Dol%2045%2C%202222%20Jakobski%20dol!5e0!3m2!1sen!2ssi!4v1680200277978!5m2!1sen!2ssi"
      width="1080"
      height="300"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  );
};

const ContactInfo: FC<ContactInfoProps> = ({ contact }) => {
  const { t } = useTranslation('common');

  return (
    <div className={'flex flex-col gap-2 ml-5 my-8'}>
      <div className={'mb-4'}>
        <h1 className={'font-bold text-3xl text-black'}>{t('contact-us')}</h1>
          <div className="relative">
              <div className="border-t border-tint border-2 mb-5 w-60 blur-sm absolute"></div>
              <div className="border-t border-white border-2 mb-5 w-60 relative"></div>
          </div>
      </div>
      <div className={'font-semibold text-black'}>{contact.name}</div>
      <div className={'text-black'}>
          <b>{t('stakeholder')}:</b> <span className={'text-accent text-tint-2'}>{contact.representative}</span>
      </div>
      <div className={'text-black'}>
          <b>{t('firm-address')}:</b> <span className={'text-accent text-tint-2'}>{contact.address}</span>
      </div>
      <div className={'text-black'}>
          <b>{t('firm-phone')}:</b> <span className={'text-accent text-tint-2'}>{contact.phone}</span>
      </div>
      <div className={'text-black'}>
          <b>{t('firm-email')}:</b> <span className={'text-accent text-tint-2'}>{contact.email}</span>
      </div>
      <div className={'text-black'}>
          <b>{t('tax-number')}:</b> <span className={'text-accent text-tint-2'}>{contact.taxNumber}</span>
      </div>
      <div className={'text-black'}>
          <b>{t('registration-number')}:</b> <span className={'text-accent text-tint-2'}>{contact.registrationNumber}</span>
      </div>
    </div>
  );
};

const Contact: FC = (props: any) => {
  const { t } = useTranslation('common');

    const faq = [
        {
            question: t('faq1'),
            answer: t('faq1answer'),
        },
        {
            question: t('faq2'),
            answer: t('faq2answer'),
        },
        {
            question: t('faq3'),
            answer: t('faq3answer'),
        },
    ];

  return (
    <>
      <Head>
        <title>{t('contact-meta')}</title>
          <meta content="text/html; charset=utf-8"/>
          <meta name="language" content="Slovenian"/>
          <meta
              name="description"
              content="Sugo d.o.o. Mehanska obdelava kovin in druge storitve. Družinsko podjetje, ki se ukvarja s struženjem, rezkanjem in tehnničnim svetovanjem. Specialisti na področju CNC izdelave izdelkov iz različnih materialov."
          />
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <meta name="robots" content="all"/>
          <meta name="author" content="sugo"/>
          <meta name="title" content="Sugo d.o.o"/>
          <meta name="keywords"
                content="sugo, SUGO, sugo d.o.o, mehanska obdelava kovin, cnc, rezkanje, struženje, tehnično svetovanje, družinsko podjetje, strojna obdelava kovin, sodobni strojni park, Boštjan Golob s.p."/>
          <meta content="SUGO d.o.o" property="og:title"/>
          <meta content="Smo družinsko podjetje SUGO d.o.o. Stremimo k konstantnemu razvoju in potrebam naših strank, kar zagotavljamo s sodobnim strojnim parkom in dobrimi poslovnimi procesi. Z vsakoletnimi investicijami v strojni park sledimo trendu trga in izpolnjujemo želje naših naročnikov. Skrbimo za konkurenčnost na trgu, visoko kakovost, široko paleto izdelkov, inovacije in tehnično podporo. Naša osnova dejavnost je mehanska obdelava kovin. Specializiramo se predvsem v rezkanju in struženju izdelkov iz različnih materialov (železo, plastika, aluminij, legirano jeklo, medenina, …). V desetletju si je podjetje s kakovostjo in poštenostjo pridobilo zaupanje na zahtevnem trgu, domačih in tujih naročnikov. Prav tako bomo v prihodnje svoj trud vlagali v razvoj, inovacije in kakovost svojih izdelkov, z namenom zadovoljitve želja in potreb trga ter naših strank. Obdelavo vseh materialov odlikujeta vrhunska preciznost in kakovost, da so v skladu s strogimi tehničnimi standardi." property="og:description"/>
          <link rel="icon" href="/favicon.ico"/>
          <meta name="next-head-count" content="15" />
      </Head>

      <div
        className={
          'flex flex-col sm:grid sm:grid-cols-2 rounded border-2 border-accent3 m-4 sm:m-20'
        }
      >
        <div className={'rounded p-4'}>
          <ContactForm />
        </div>
        <div className={'flex flex-col bg-accent-3 text-white p-4'}>
          <ContactInfo contact={props.contact.data.attributes.contact} />
        </div>
      </div>

      <div className={'flex flex-col mx-4 mb-4 sm:mx-20 sm:mb-20'}>
        <h1 className={'text-2xl font-bold mb-8'}>{t('faq')}</h1>
        <div className={'flex flex-col'}>
          {faq.map((item, index) => (
            <div key={index}>
              <FaqAccordion question={item.question} answer={item.answer} />
            </div>
          ))}
        </div>
      </div>
      <div className={'relative'}>
        <Map />
      </div>
    </>
  );
};

export default Contact;

export async function getStaticProps({ locale }: Locale) {
  const contact = await getContact();

  return {
    props: {
      ...await serverSideTranslations(locale, ['common']),
      contact,
    },
  };
}
