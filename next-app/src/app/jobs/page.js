import Jobs from '@/views/Jobs';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';
import News from '@/models/News';


export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/jobs' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
        alternates: { canonical: '/jobs' },
      };
    }
  } catch (e) {}
  return {
    title: 'नौकरी समाचार – Jobs & Sarkari Naukri',
    description: 'सरकारी नौकरी, भर्ती, वैकेंसी और रोज़गार से जुड़ी ताज़ा खबरें हिंदी में।',
    alternates: { canonical: '/jobs' },
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
      category: { $regex: new RegExp('^jobs$', 'i') }, 
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
      console.error('Error fetching SSR data for jobs:', error);
  }

  return <Jobs initialNewsData={initialNewsData} initialLatestNewsData={initialLatestNewsData} />;
}
