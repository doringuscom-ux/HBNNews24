import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import NodeCache from 'node-cache';

const cache = global.newsCache || new NodeCache({ stdTTL: 120 });
if (!global.newsCache) global.newsCache = cache;

export async function getHomeNewsData() {
    try {
        const cacheKey = 'home_news';
        if (cache.has(cacheKey)) {
            return cache.get(cacheKey);
        }

        await connectToDatabase();
        const categories = ['sports', 'religion', 'lifestyle', 'technology', 'business', 'entertainment', 'superfast', 'featured'];
        
        const queries = categories.map(cat => 
            News.find({ category: cat, status: { $ne: 'draft' } }).sort({ createdAt: -1 }).limit(12).lean()
        );
        
        queries.push(News.find({ category: { $nin: categories }, status: { $ne: 'draft' } }).sort({ createdAt: -1 }).limit(12).lean());
        queries.push(News.find({ status: { $ne: 'draft' } }).sort({ createdAt: -1 }).limit(20).lean());

        const results = await Promise.all(queries);
        
        const homeData = {};
        categories.forEach((cat, index) => {
            homeData[cat] = JSON.parse(JSON.stringify(results[index]));
        });
        homeData.mixNews = JSON.parse(JSON.stringify(results[categories.length]));
        const latestFallback = JSON.parse(JSON.stringify(results[categories.length + 1]));

        const fillNews = (categoryNews, excludeIds = new Set()) => {
            if (categoryNews.length >= 12) return categoryNews;
            const borrowed = latestFallback.filter(n => {
                if (categoryNews.some(cn => String(cn._id) === String(n._id))) return false;
                if (excludeIds.has(String(n._id))) return false;
                return true;
            });
            return [...categoryNews, ...borrowed].slice(0, 12);
        };

        homeData.superfast = fillNews(homeData.superfast || []);
        homeData.featured = fillNews(homeData.featured || []);

        const topNewsIds = new Set();
        homeData.superfast.forEach(n => topNewsIds.add(String(n._id)));
        homeData.featured.forEach(n => topNewsIds.add(String(n._id)));

        homeData.mixNews = fillNews(homeData.mixNews || [], topNewsIds);
        categories.forEach(cat => {
            if (cat !== 'superfast' && cat !== 'featured') {
                homeData[cat] = fillNews(homeData[cat] || [], topNewsIds);
            }
        });
        
        homeData.latestNews = latestFallback;

        cache.set(cacheKey, homeData);
        return homeData;
    } catch (error) {
        console.error('Error fetching home news data:', error);
        return {
            latestNews: [], mixNews: [], sports: [], religion: [], lifestyle: [], technology: [], business: [], entertainment: [], superfast: [], featured: []
        };
    }
}
