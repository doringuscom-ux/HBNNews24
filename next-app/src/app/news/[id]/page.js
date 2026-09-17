import SingleArticle from '@/views/SingleArticle';
import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import mongoose from 'mongoose';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic'; // Render on-demand via SSR - 0 ISR writes

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    await connectToDatabase();
    
    let data;
    if (mongoose.Types.ObjectId.isValid(id)) {
        data = await News.findById(id).lean();
    }
    if (!data) {
        data = await News.findOne({ slug: id }).lean();
    }
    
    if (data && data._id) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
      const articleUrl = `${siteUrl}/news/${data.slug || data._id || id}`;
      return {
        title: data.metaTitle || data.title || 'HBN24 News',
        description: data.metaDescription || (data.description ? data.description.substring(0, 160) : ''),
        keywords: data.metaKeywords || '',
        robots: data.robots || 'index, follow',
        alternates: {
          canonical: articleUrl,
        },
        openGraph: {
          title: data.metaTitle || data.title,
          description: data.metaDescription || data.description,
          url: articleUrl,
          type: 'article',
          publishedTime: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
          modifiedTime: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
          images: data.image ? [data.image.startsWith('http') ? data.image : `${siteUrl}${data.image.startsWith('/') ? '' : '/'}${data.image}`] : [`${siteUrl}/icon-192.png`],
        },
        twitter: {
          card: 'summary_large_image',
          title: data.metaTitle || data.title,
          description: data.metaDescription || data.description,
          images: data.image ? [data.image.startsWith('http') ? data.image : `${siteUrl}${data.image.startsWith('/') ? '' : '/'}${data.image}`] : [`${siteUrl}/icon-192.png`],
        }
      };
    }
  } catch (error) {
    console.error('Error fetching metadata for article:', error);
  }
  return {
    title: 'HBN24 News',
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  let initialArticle = null;
  let initialLatestNews = [];
  
  try {
    await connectToDatabase();
    
    // Fetch article and latest news in parallel directly from DB (fast, 0 client delay)
    const [articleDoc, latestDocs] = await Promise.all([
      (async () => {
        if (mongoose.Types.ObjectId.isValid(id)) {
          const found = await News.findById(id).lean();
          if (found) return found;
        }
        return await News.findOne({ slug: id }).lean();
      })(),
      News.find(
        { status: { $ne: 'draft' } },
        { title: 1, slug: 1, image: 1, createdAt: 1, category: 1 }
      )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
    ]);

    if (articleDoc) {
      initialArticle = {
        ...articleDoc,
        _id: articleDoc._id.toString(),
        createdAt: articleDoc.createdAt ? articleDoc.createdAt.toString() : '',
        updatedAt: articleDoc.updatedAt ? articleDoc.updatedAt.toString() : ''
      };
    }

    if (Array.isArray(latestDocs)) {
      initialLatestNews = latestDocs.map(item => ({
        ...item,
        _id: item._id.toString(),
        createdAt: item.createdAt ? item.createdAt.toString() : '',
        updatedAt: item.updatedAt ? item.updatedAt.toString() : ''
      }));
    }
  } catch (error) {
    console.error('Error fetching initial article and latest news:', error);
  }

  if (!initialArticle) {
      notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
  let newsArticleSchema = null;
  let breadcrumbSchema = null;

  if (initialArticle) {
    const articleUrl = `${siteUrl}/news/${initialArticle.slug || initialArticle._id || id}`;
    const categoryName = Array.isArray(initialArticle.category) 
      ? (initialArticle.category[0] || 'News') 
      : (initialArticle.category || 'News');

    newsArticleSchema = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl
      },
      headline: initialArticle.title,
      description: initialArticle.metaDescription || initialArticle.description || (initialArticle.content ? initialArticle.content.replace(/<[^>]*>/g, '').substring(0, 160) : ''),
      image: initialArticle.image ? [initialArticle.image.startsWith('http') ? initialArticle.image : `${siteUrl}${initialArticle.image.startsWith('/') ? '' : '/'}${initialArticle.image}`] : [`${siteUrl}/favicon.png`],
      datePublished: initialArticle.createdAt ? new Date(initialArticle.createdAt).toISOString() : new Date().toISOString(),
      dateModified: initialArticle.updatedAt ? new Date(initialArticle.updatedAt).toISOString() : (initialArticle.createdAt ? new Date(initialArticle.createdAt).toISOString() : new Date().toISOString()),
      author: {
        '@type': 'Person',
        name: initialArticle.author || 'HBN News 24 Team',
        url: `${siteUrl}/authors`
      },
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'HBN News 24',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/favicon.png`,
          width: 512,
          height: 512
        }
      },
      articleSection: categoryName,
      inLanguage: 'hi'
    };

    breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteUrl
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: categoryName,
          item: `${siteUrl}/${categoryName.toLowerCase()}`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: initialArticle.title,
          item: articleUrl
        }
      ]
    };
  }

  return (
    <>
      {newsArticleSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <SingleArticle initialArticle={initialArticle} initialLatestNews={initialLatestNews} />
    </>
  );
}
