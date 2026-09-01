import Epaper from '@/views/Epaper';

import connectToDatabase from '@/lib/mongodb';
import PageSeo from '@/models/PageSeo';
import News from '@/models/News';
import Suvichar from '@/models/Suvichar';
import Panchang from '@/models/Panchang';
import { getTodayPanchang } from '@/utils/panchang';
export async function generateMetadata() {
  try {
    await connectToDatabase();
    const seo = await PageSeo.findOne({ pageUrl: '/epaper' });
    if (seo && seo.metaTitle) {
      return {
        title: seo.metaTitle,
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',
      };
    }
  } catch (e) {}
  return {};
}


export const revalidate = 60;

export default async function Page() {
  let initialNews = [];
  let initialSuvichar = null;
  let initialPanchang = null;

  try {
    await connectToDatabase();

    // Fetch Suvichar
    const suvicharData = await Suvichar.findOne().sort({ createdAt: -1 }).lean();
    if (suvicharData && suvicharData.text) {
        initialSuvichar = suvicharData.text;
    }

    // Auto-generate Panchang offline (instantly)
    const panchangData = getTodayPanchang();
    if (panchangData) {
        initialPanchang = panchangData;
    }

    // Fetch News for E-paper
    // 1. Get all epaper news (published only)
    const epaperNews = await News.find({ isEpaper: true, status: { $ne: 'draft' } }).sort({ createdAt: -1 }).lean();
    
    // 2. Filter for last 4 days
    const fourDaysAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
    const recentEpaperNews = epaperNews.filter(item => new Date(item.createdAt) >= fourDaysAgo);
    
    let displayNews = [...recentEpaperNews];
    const usedIds = new Set(displayNews.map(item => item._id.toString()));

    // 3. Pad with older epaper news up to 88 items
    if (displayNews.length < 88) {
        for (const item of epaperNews) {
            if (displayNews.length >= 88) break;
            if (!usedIds.has(item._id.toString())) {
                displayNews.push(item);
                usedIds.add(item._id.toString());
            }
        }
    }

    // 4. If still less than 88, pad with regular news
    if (displayNews.length < 88) {
        const otherNews = await News.find({ isEpaper: { $ne: true } }).sort({ createdAt: -1 }).limit(88).lean();
        for (const item of otherNews) {
            if (displayNews.length >= 88) break;
            if (!usedIds.has(item._id.toString())) {
                displayNews.push(item);
                usedIds.add(item._id.toString());
            }
        }
    }

    // Convert ObjectIds and Dates to strings for Client Component
    initialNews = displayNews.map(item => ({
        ...item,
        _id: item._id.toString(),
        createdAt: item.createdAt ? item.createdAt.toString() : null,
        updatedAt: item.updatedAt ? item.updatedAt.toString() : null,
    }));

  } catch (error) {
      console.error('Error fetching E-paper SSR data:', error);
  }

  return <Epaper initialNews={initialNews} initialSuvichar={initialSuvichar} initialPanchang={initialPanchang} />;
}
