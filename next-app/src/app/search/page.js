import { Suspense } from 'react';
import Search from '@/views/Search';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';


export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/search' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: 'noindex, follow',
      };
    }
  } catch (e) {}
  return { robots: 'noindex, follow' };
}


export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading search...</div>}>
      <Search />
    </Suspense>
  );
}
