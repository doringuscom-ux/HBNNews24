export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/'],
      },
      {
        userAgent: 'Googlebot-News',
        allow: '/',
      }
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/news-sitemap.xml`
    ],
  };
}
