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
  try {
    const seo = await getGlobalSeo();
    if (seo && seo.googleAnalyticsId) {
      googleAnalyticsId = seo.googleAnalyticsId;
    }
  } catch (e) {}

  return (
    <html lang="hi" suppressHydrationWarning className={`${notoDevanagari.variable} ${yatraOne.variable}`}>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-white">
        <ClientLayout googleAnalyticsId={googleAnalyticsId}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}

