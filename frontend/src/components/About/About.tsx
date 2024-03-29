import React, {FC} from 'react';
import CompanyTimeline from "@/components/CompanyTimeline/CompanyTimeline";
import {chunkSubstr} from "@/utils/chunkString";
import {useTranslation} from "next-i18next";

interface AboutProps {
    about: string;
}

const About:FC<AboutProps> = ({ about }) => {
    const { t } = useTranslation('common');

    return (
        <div className="px-5 sm:px-20 sm:my-16">
            <h1 className="text-3xl font-bold mb-8">{t('about')}</h1>
            <div className="flex flex-row flex-wrap justify-between">
                <div className="w-full lg:w-4/6 flex flex-col gap-5">
                    {chunkSubstr(about).map((sentenceGroup, index) => (
                        <p key={index} className="text-lg text-tint-2">{sentenceGroup}</p>
                    ))}
                </div>
                <CompanyTimeline />
            </div>
        </div>
    );
};
export default About;