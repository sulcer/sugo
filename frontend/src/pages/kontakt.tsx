import React, { FC } from 'react';
import { ContactForm } from '@/components';
import Head from 'next/head';

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

const ContactInfo = () => {
  return (
    <div className={'flex flex-col gap-2'}>
      <h1 className={'font-bold text-3xl text-accent-2'}>Kontakt</h1>
      <div className={'font-semibold'}>SUGO d.o.o.</div>
      <div>
        <b>Zastopnik:</b> Boštjan Golob, direktor
      </div>
      <div>
        <b>Naslov:</b> Spodnji Jakobski Dol 45, 2222 Jakobski dol
      </div>
      <div>
        <b>Telefon:</b> +386 41 555 555
      </div>
      <div>
        <b>E-pošta:</b> sugo@mail.com
      </div>
      <div>
        <b>Davčna številka:</b> 59203676
      </div>
      <div>
        <b>Matična številka: </b>8550859000
      </div>
    </div>
  );
};

const Contact: FC = () => {
  return (
    <>
      <Head>
        <title>Kontakt</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div className={'grid grid-cols-2 sm:mx-20 my-12'}>
          <ContactInfo />
          <ContactForm />
        </div>

        <Map />
      </div>
    </>
  );
};

export default Contact;
