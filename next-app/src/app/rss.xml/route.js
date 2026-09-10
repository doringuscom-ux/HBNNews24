import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';

export const revalidate = 600; // Revalidate every 10 minutes

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';

  try {
    await connectToDatabase();

    // Fetch the latest 50 published articles for RSS feed
    const newsList = await News.find({ status: { $ne: 'draft' } })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('title slug _id description content image category author createdAt')
      .lean();

    const itemsXml = newsList.map((news) => {
      const articleUrl = `${baseUrl}/news/${news.slug || news._id}`;
      const pubDate = new Date(news.createdAt || Date.now()).toUTCString();
      const category = Array.isArray(news.category) 
        ? (news.category[0] || 'News') 
        : (news.category || 'News');
      const author = news.author || 'HBN News 24 Team';
      
      const rawDescription = news.description || news.content || '';
      const cleanSnippet = rawDescription
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 300);

      const imageUrl = news.image 
        ? (news.image.startsWith('http') ? news.image : `${baseUrl}${news.image.startsWith('/') ? '' : '/'}${news.image}`)
        : '';

      return `
    <item>
      <title><![CDATA[${news.title || 'HBN24 News'}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${author}]]></dc:creator>
      <category><![CDATA[${category}]]></category>
      <description><![CDATA[${cleanSnippet}]]></description>
      ${imageUrl ? `<enclosure url="${imageUrl}" length="0" type="image/jpeg" />` : ''}
      ${imageUrl ? `<media:content url="${imageUrl}" medium="image" />` : ''}
    </item>`;
    }).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>HBN News 24 - Hindi News</title>
    <link>${baseUrl}</link>
    <description>Latest Hindi News, Breaking News, National, Punjab, Haryana, Sports, and Entertainment updates.</description>
    <language>hi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${baseUrl}/logo.webp</url>
      <title>HBN News 24</title>
      <link>${baseUrl}</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('RSS generation error:', error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>HBN News 24</title></channel></rss>',
      {
        headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
        status: 500,
      }
    );
  }
}
