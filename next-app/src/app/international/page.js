import International from '@/views/International';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';
import News from '@/models/News';


export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/international' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/international' },
      };
    }
  } catch (e) {}
  return {
    title: 'विदेश समाचार – International News in Hindi',
    description: 'दुनिया भर की ताज़ा अंतरराष्ट्रीय खबरें और विदेश की ब्रेकिंग न्यूज़ हिंदी में पढ़ें।',
    alternates: { canonical: '/international' },
  };
}


export const revalidate = 900;

export default async function Page() {
  let initialNewsData = [];
  let initialLatestNewsData = [];

  try {
    await connectToDatabase();
    
    // Fetch category specific news (limit to top 20 for safety)
    const catNews = await News.find({ 
      category: { $regex: new RegExp('^international$', 'i') }, 
      status: { $ne: 'draft' } 
    }).sort({ createdAt: -1 }).limit(20).lean();
    
    // Fetch latest news for sidebar
    const latestNews = await News.find({ status: { $ne: 'draft' } }).sort({ createdAt: -1 }).limit(10).lean();

    const serializeNews = (items) => items.map(item => ({
        ...item,
        _id: item._id.toString(),
        createdAt: item.createdAt ? item.createdAt.toString() : null,
        updatedAt: item.updatedAt ? item.updatedAt.toString() : null,
    }));

    initialNewsData = serializeNews(catNews);
    initialLatestNewsData = serializeNews(latestNews);
  } catch (error) {
      console.error('Error fetching SSR data for international:', error);
  }

  return <International initialNewsData={initialNewsData} initialLatestNewsData={initialLatestNewsData} />;
}
