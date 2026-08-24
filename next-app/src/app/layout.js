import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import connectToDatabase from '@/lib/mongodb';
import GlobalSeo from '@/models/GlobalSeo';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
  try {
    await connectToDatabase();
    const seo = await GlobalSeo.findOne();
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
        icons: {
          icon: '/icon.webp',
          shortcut: '/icon.webp',
          apple: '/icon.webp',
        },
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
    icons: {
      icon: '/icon.webp',
      shortcut: '/icon.webp',
      apple: '/icon.webp',
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
    await connectToDatabase();
    const seo = await GlobalSeo.findOne();
    if (seo && seo.googleAnalyticsId) {
      googleAnalyticsId = seo.googleAnalyticsId;
    }
  } catch (e) {}

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;900&family=Yatra+One&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-white">
        <ClientLayout googleAnalyticsId={googleAnalyticsId}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
