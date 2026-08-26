import BreakingNewsPage from '@/views/BreakingNewsPage';
import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';
import BreakingNews from '@/models/BreakingNews';

export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/breaking-news' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
      };
    }
  } catch (e) {}

  return {
    title: 'Live Breaking News & Flash Headlines | HBN News 24',
    description: 'Get real-time breaking news, flash alerts, and urgent live headlines in Hindi from India and around the world at HBN News 24.',
  };
}

export default async function Page() {
  let initialNews = [];

  try {
    await connectToDatabase();
    const docs = await BreakingNews.find().sort({ createdAt: -1 }).limit(50).lean();
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
