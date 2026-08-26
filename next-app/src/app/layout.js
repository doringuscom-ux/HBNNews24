import { Noto_Sans_Devanagari, Yatra_One } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { getGlobalSeo } from "@/lib/getGlobalSeo";

const notoDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '600', '700', '900'],
  subsets: ['devanagari', 'latin'],
  variable: '--font-noto-devanagari',
  display: 'swap',
});

const yatraOne = Yatra_One({
  weight: ['400'],
  subsets: ['devanagari', 'latin'],
  variable: '--font-yatra-one',
  display: 'swap',
});

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
  try {
    const seo = await getGlobalSeo();
    if (seo) {
      return {
        metadataBase: new URL(siteUrl),
        alternates: {
          canonical: './',
        },
        title: {
          template: `%s | ${seo.siteTitle || 'HBN24 News'}`,
          default: seo.siteTitle || 'HBN24 News',
        },
        description: seo.metaDescription || '',
        keywords: seo.metaKeywords || '',
        robots: seo.robots || 'index, follow',

        openGraph: {
          title: seo.siteTitle || 'HBN24 News',
          description: seo.metaDescription || '',
          url: siteUrl,
          siteName: seo.siteTitle || 'HBN24 News',
          locale: 'hi_IN',
          type: 'website',
        },
      };
    }
  } catch (error) {
    console.error('Error fetching global SEO for metadata:', error);
  }
  
  return {
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: './',
    },
    title: {
      template: `%s | HBN24 News`,
      default: 'HBN24 News',
    },
  };
}

export default async function RootLayout({ children }) {
  let googleAnalyticsId = null;
  let siteTitle = 'HBN News 24';
  let metaDescription = 'Latest Hindi News, Breaking News, National, Punjab, Haryana, Sports, and Entertainment updates.';
  
  try {
    const seo = await getGlobalSeo();
    if (seo) {
      if (seo.googleAnalyticsId) googleAnalyticsId = seo.googleAnalyticsId;
      if (seo.siteTitle) siteTitle = seo.siteTitle;
      if (seo.metaDescription) metaDescription = seo.metaDescription;
    }
  } catch (e) {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'HBN News 24',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/favicon.png`,
      width: 512,
      height: 512
    },
    sameAs: [
      'https://x.com/HbnNews24',
      'https://www.youtube.com/@hbnnews24x7'
    ]
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteTitle,
    url: siteUrl,
    description: metaDescription,
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: 'HBN News 24',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.png`
      }
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="hi" suppressHydrationWarning className={`${notoDevanagari.variable} ${yatraOne.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-white">
        <ClientLayout googleAnalyticsId={googleAnalyticsId}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
