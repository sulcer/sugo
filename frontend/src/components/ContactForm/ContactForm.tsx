import React, { FC, FormEvent, useEffect, useState } from 'react';
import Input from '@/components/ContactForm/Input';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {useTranslation} from "next-i18next";

export const ContactForm: FC = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [verified, setVerified] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();
  const { t } = useTranslation('common');

  useEffect(() => {
    const handleReCaptchaVerify = async () => {
      if (!executeRecaptcha) {
        return;
      }
      const token = await executeRecaptcha();
      setVerified(!!token);
    };

    handleReCaptchaVerify();
    return () => {
      setVerified(false);
    };
  }, [executeRecaptcha]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: email,
        subject,
        text,
      }),
    });
    setText('');
    setEmail('');
    setSubject('');
  };

  return (
    <form className={'flex flex-col w gap-6'} onSubmit={handleSubmit}>
      <Input
        label={t('firm-email') as string}
        type={"email"}
        required
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
      />
      <Input
        label={t('subject') as string}
        required
        value={subject}
        onChange={(e) => setSubject(e.currentTarget.value)}
      />
      <div className={'flex flex-col relative z-0 w-full'}>
        <textarea
          placeholder={' '}
          required
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          cols={10}
          rows={10}
          className={
            'pl-2 pb-1 pt-2 border-2 border-accent bg-transparent rounded outline-none'
          }
        />
        <label
          className={
            'absolute top-1.5 ml-2 -z-1 bg-transparent duration-300 origin-0 text-tint-2'
          }
        >
          {t('message')}
        </label>
      </div>
      <div className={'flex flex-row w-full items-start'}>
        <input
          required
          type={'checkbox'}
          checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}
          className={'mt-0.5'}
        />
        <p className={'ml-2 text-black text-xs opacity-50'}>
          {t('GDPR-form1')}{' '}
          <Link href="/varovanje-osebnih-podatkov" className={'font-bold'}>
            {t('GDPR-form2')}
          </Link>
          {t('GDPR-form3')}
        </p>
      </div>
      <motion.div
        className="box w-24"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <button
          disabled={!verified}
          className={
            'bg-accent text-white py-2 px-8 rounded w-full sm:w-fit disabled:opacity-90 disabled:cursor-not-allowed'
          }
          type="submit"
        >
          {t('send')}
        </button>
      </motion.div>
    </form>
  );
};
