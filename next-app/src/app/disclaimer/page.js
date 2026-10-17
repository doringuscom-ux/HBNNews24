import Disclaimer from '@/views/Disclaimer';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';


export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/disclaimer' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/disclaimer' },
      };
    }
  } catch (e) {}
  return {
    title: 'अस्वीकरण – Disclaimer',
    alternates: { canonical: '/disclaimer' },
  };
}


export default function Page() {
  return <Disclaimer />;
}
