import type { MetadataRoute } from 'next';
import { COMPANY } from '@/content/company';

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/' }, sitemap: `${COMPANY.url}/sitemap.xml` };
}
