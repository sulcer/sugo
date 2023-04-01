import React from 'react';
import Image, { StaticImageData } from 'next/image';
import styles from './MachineImageCard.module.scss';

type MachineImageCardProps = {
  src: StaticImageData;
  alt: string;
  name: string;
  info: string;
};

const MachineImageCard = ({ src, alt, name, info }: MachineImageCardProps) => {
  return (
    <div className={styles.imageWrapper}>
      <Image src={src} alt={alt} className={'rounded-md'} />
      <div className={styles.content}>
        <h1
          className={
            'text-white font-bold text-center text-xl md:text-sm lg:text-xs xl:text-xl border-b-2 border-gray-300 mx-16 md:mx-12 lg:mx-24 my-2'
          }
        >
          {name}
        </h1>
        {/*<hr className="w-48 h-[2px] mx-auto bg-gray-100 border-0 rounded" />*/}
        <p
          className={
            'text-white text-lg md:text-xs lg:text-sm lg:max-w-md mx-4'
          }
        >
          {info}
        </p>
      </div>
    </div>
  );
};
export default MachineImageCard;