import BreakingNewsPage from '@/views/BreakingNewsPage';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';
import BreakingNews from '@/models/BreakingNews';

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
  const defaultImage = 'https://res.cloudinary.com/dsd6oj52y/image/upload/v1787380341/hbn24_news/pdhg8ghjjd5fy7bdzkgc.jpg';

  let title = 'Live Breaking News & Flash Headlines | HBN News 24';
  let description = 'Get real-time breaking news, flash alerts, and urgent live headlines in Hindi from India and around the world at HBN News 24.';
  let keywords = '';
  let robots = 'index, follow';

  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/breaking-news' });
    if (seo && seo.metaTitle) {
      title = seo.metaTitle;
      description = seo.metaDescription || description;
      keywords = seo.metaKeywords || keywords;
      robots = seo.robots || robots;
    }
  } catch (e) {}

  return {
    title,
    description,
    keywords,
    robots,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/breaking-news`,
      siteName: 'HBN24 News',
      images: [
        {
          url: defaultImage,
          width: 192,
          height: 192,
          alt: title,
        },
      ],
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [defaultImage],
    },
  };
}

export const revalidate = 0;

export default async function Page() {
  let initialNews = [];

  try {
    await connectToDatabase();
    const docs = await BreakingNews.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).limit(50).lean();
    initialNews = docs.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt ? doc.createdAt.toString() : null,
    }));
  } catch (error) {
    console.error('Error fetching SSR breaking news:', error);
  }

  return <BreakingNewsPage initialNews={initialNews} />;
}
