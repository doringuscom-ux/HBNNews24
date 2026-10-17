import ReportersList from '@/views/ReportersList';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/authors' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/authors' },
      };
    }
  } catch (e) {}
  return {
    alternates: { canonical: '/authors' },
    title: 'Our Authors & Journalists | HBN News 24',
    description: 'Meet the dedicated journalists, field reporters, editors, and columnists delivering accurate, verified news daily at HBN News 24.',
  };
}

export default function Page() {
  return <ReportersList />;
}
