import React from 'react';
import Head from 'next/head';
import { MachineParkGallery } from '@/components';

const Headline = () => (
  <div className={'mx-16 mt-14'}>
    <h1 className={'text-2xl font-bold'}>Strojni park</h1>
    <p className={'text-lg'}>
      Sodobno opremljen strojni park za reševanje tudi najbolj zahtevnih
      problemov
    </p>
  </div>
);

const MachineParkPage = () => {
  return (
    <>
      <Head>
        <title>Strojni park</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Headline />
      <MachineParkGallery />
    </>
  );
};

export default MachineParkPage;
