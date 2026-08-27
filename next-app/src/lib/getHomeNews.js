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
            News.find({ 
                category: { $regex: new RegExp(`^${cat}$`, 'i') }, 
                status: { $ne: 'draft' } 
            }).select('-content -seoTitle -seoDescription -tags').sort({ createdAt: -1 }).limit(15).lean()
        );
        
        queries.push(News.find({ 
            category: { $nin: categories }, 
            status: { $ne: 'draft' } 
        }).select('-content -seoTitle -seoDescription -tags').sort({ createdAt: -1 }).limit(20).lean());
        queries.push(News.find({ status: { $ne: 'draft' } }).select('-content -seoTitle -seoDescription -tags').sort({ createdAt: -1 }).limit(100).lean());

        const results = await Promise.all(queries);
        
        const homeData = {};
        categories.forEach((cat, index) => {
            homeData[cat] = JSON.parse(JSON.stringify(results[index]));
        });
        const latestFallback = JSON.parse(JSON.stringify(results[categories.length + 1]));

        // Global usedIds Set to ensure NO news item repeats anywhere on the home page!
        const usedIds = new Set();

        // 1. Featured News: Priority to explicit 'featured' news, fill up to 3 from latest fallback
        let featuredList = homeData.featured || [];
        if (featuredList.length < 3) {
            for (const n of latestFallback) {
                if (featuredList.length >= 3) break;
                const id = String(n._id);
                if (!featuredList.some(fn => String(fn._id) === id)) {
                    featuredList.push(n);
                }
            }
        }
        homeData.featured = featuredList.slice(0, 3);
        homeData.featured.forEach(n => usedIds.add(String(n._id)));

        // 2. Aaj Ki Taza News (mixNews): Subsequent latest news excluding the 3 featured news
        const mixList = [];
        for (const n of latestFallback) {
            const id = String(n._id);
            if (!usedIds.has(id)) {
                mixList.push(n);
                usedIds.add(id);
                if (mixList.length >= 10) break;
            }
        }
        homeData.mixNews = mixList;

        // 3. Category Sections: entertainment, sports, religion, lifestyle, technology, business, superfast
        // Each category gets its genuine category articles (excluding already used IDs)
        // If a category has fewer items, borrow only unused items from latestFallback
        const otherCategories = ['entertainment', 'sports', 'religion', 'lifestyle', 'technology', 'business', 'superfast'];
        
        otherCategories.forEach(cat => {
            const rawCatItems = homeData[cat] || [];
            const cleanCatItems = [];

            // Add authentic category items not yet used
            for (const item of rawCatItems) {
                const id = String(item._id);
                if (!usedIds.has(id)) {
                    cleanCatItems.push(item);
                    usedIds.add(id);
                }
            }

            // If category needs more items, fill from remaining unused latest news
            if (cleanCatItems.length < 8) {
                for (const n of latestFallback) {
                    if (cleanCatItems.length >= 8) break;
                    const id = String(n._id);
                    if (!usedIds.has(id)) {
                        cleanCatItems.push(n);
                        usedIds.add(id);
                    }
                }
            }

            homeData[cat] = cleanCatItems;
        });

        // 4. Breaking news ticker: uses latest news
        homeData.latestNews = latestFallback.slice(0, 10);

        cache.set(cacheKey, homeData);
        return homeData;
    } catch (error) {
        console.error('Error fetching home news data:', error);
        return {
            latestNews: [], mixNews: [], sports: [], religion: [], lifestyle: [], technology: [], business: [], entertainment: [], superfast: [], featured: []
        };
    }
}
