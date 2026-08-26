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
        alternates: {
          canonical: '/reporter',
        },
        openGraph: {
          title: seo.metaTitle,
          description: seo.metaDescription || '',
          url: 'https://hbnnews24.com/reporter',
          type: 'website',
        },
      };
    }
  } catch (e) {}

  return {
    title: 'Our Reporters & Journalists Directory | HBN News 24',
    description: 'Meet the dedicated journalists, field reporters, and editors delivering truthful, verified news 24x7 at HBN News 24.',
    robots: 'index, follow',
    alternates: {
      canonical: '/reporter',
    },
  };
}

export default function Page() {
  return <ReportersList />;
}
