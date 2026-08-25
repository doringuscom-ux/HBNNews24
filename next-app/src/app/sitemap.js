import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';

export const revalidate = 3600; // Revalidate every 1 hour

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';

  try {
    await connectToDatabase();

    // Fetch the latest 2000 articles to avoid Vercel memory limits
    const newsList = await News.find()
      .sort({ createdAt: -1 })
      .limit(2000)
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
      '/about',
      '/contactus',
      '/privacy-policy',
      '/termsconditions',
      '/disclaimer',
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
      '/authors'
    ].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: route === '' ? 1.0 : 0.7,
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
