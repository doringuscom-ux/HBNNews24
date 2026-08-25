import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';

export const revalidate = 600; // Revalidate every 10 minutes for Google News

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';

  try {
    await connectToDatabase();

    // Google News sitemaps should only include articles published in the last 48 hours.
    // We'll fetch the latest 500 articles just to be safe, sorted by newest first.
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    
    const newsList = await News.find({ createdAt: { $gte: fortyEightHoursAgo } })
      .sort({ createdAt: -1 })
      .limit(500)
      .select('slug _id title createdAt')
      .lean();

    // Generate the XML string manually for Google News specific tags
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${newsList.map((news) => {
    // Escape XML special characters in title
    const safeTitle = (news.title || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
      
    const pubDate = new Date(news.createdAt || Date.now()).toISOString();
    const url = `${baseUrl}/news/${news.slug || news._id}`;

    return `
  <url>
    <loc>${url}</loc>
    <news:news>
      <news:publication>
        <news:name>HBN24 News</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${safeTitle}</news:title>
    </news:news>
  </url>`;
  }).join('')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200'
      },
    });
  } catch (error) {
    console.error('News Sitemap generation error:', error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      headers: { 'Content-Type': 'application/xml' },
      status: 500,
    });
  }
}
