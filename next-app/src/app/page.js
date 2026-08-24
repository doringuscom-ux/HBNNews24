import Home from '@/views/Home';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: {
          canonical: '/',
        },
        openGraph: {
          title: seo.metaTitle,
          description: seo.metaDescription || '',
          url: siteUrl,
          siteName: 'HBN24 News',
          locale: 'hi_IN',
          type: 'website',
        },
      };
    }
  } catch (e) {}
  
  // Default fallback if DB is empty for home page
  return {
    title: 'HBN News24: Latest News, Breaking News & Daily Headlines',
    description: 'Get latest Hindi news, breaking news, politics, sports, entertainment, business, and daily news updates from India and around the world on HBN News24.',
    keywords: 'हिंदी समाचार, ताज़ा ख़बरें, भारत, राजनीति, खेल, मनोरंजन, व्यापार, HBN24',
    robots: 'index, follow',
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: 'HBN News24: Latest News, Breaking News & Daily Headlines',
      description: 'Get latest Hindi news, breaking news, politics, sports, entertainment, business, and daily news updates from India and around the world on HBN News24.',
      url: siteUrl,
      siteName: 'HBN24 News',
      locale: 'hi_IN',
      type: 'website',
    },
  };
}

import { getHomeNewsData } from '@/lib/getHomeNews';
import { getHomeVideosData } from '@/lib/getHomeVideos';

export const revalidate = 60;

export default async function Page() {
  const [initialNews, initialVideos] = await Promise.all([
    getHomeNewsData(),
    getHomeVideosData()
  ]);

  return <Home initialNews={initialNews} initialVideos={initialVideos} />;
}

