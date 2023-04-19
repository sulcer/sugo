import React from 'react';
import Head from 'next/head';
import { ProductsGallery } from '@/components';
import Headline from '@/components/Headline/Headline';
import { getProducts } from '@/lib/api';

const Products = (props: any) => {
  return (
    <>
      <Head>
        <title>Izdelki</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Headline description={'Naši izdelki'} title={'Izdelki'} />
      <ProductsGallery products={props.products.data} />
    </>
  );
};

export default Products;

export async function getServerSideProps() {
  const products = await getProducts();

  return {
    props: {
      products,
    },
  };
}
