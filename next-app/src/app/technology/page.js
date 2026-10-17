import Technology from '@/views/Technology';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';
import News from '@/models/News';


export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/technology' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/technology' },
      };
    }
  } catch (e) {}
  return {
    title: 'टेक समाचार – Technology News in Hindi',
    description: 'मोबाइल, गैजेट्स, AI, इंटरनेट और टेक्नोलॉजी की ताज़ा खबरें हिंदी में।',
    alternates: { canonical: '/technology' },
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
      category: { $regex: new RegExp('^technology$', 'i') }, 
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
      console.error('Error fetching SSR data for technology:', error);
  }

  return <Technology initialNewsData={initialNewsData} initialLatestNewsData={initialLatestNewsData} />;
}
