import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';

export const revalidate = 0; // Real-time sitemap for instant Google discovery
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';

  try {
    await connectToDatabase();

    // Fetch the latest 5000 published articles for Google indexing
    const newsList = await News.find({ status: { $ne: 'draft' } })
      .sort({ createdAt: -1 })
      .limit(5000)
      .select('slug _id updatedAt createdAt')
      .lean();

    const newsUrls = newsList.map((news) => ({
      url: `${baseUrl}/news/${news.slug || news._id}`,
      lastModified: news.updatedAt || news.createdAt || new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    const staticRoutes = [
      '',
      '/punjab',
      '/haryana',
      '/delhi',
      '/breaking-news',
      '/national',
      '/international',
      '/sports',
      '/entertainment',
      '/technology',
      '/business',
      '/lifestyle',
      '/religion',
      '/education',
      '/epaper',
      '/authors',
      '/about',
      '/contact',
      '/privacy-policy',
      '/terms',
      '/disclaimer',
      '/editorial-policy',
      '/fact-check-policy',
      '/corrections-policy'
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1.0 : (['/punjab', '/haryana', '/delhi', '/breaking-news', '/epaper'].includes(route) ? 0.9 : 0.7),
    }));

    return [...staticRoutes, ...newsUrls];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
      }
    ];
  }
}
