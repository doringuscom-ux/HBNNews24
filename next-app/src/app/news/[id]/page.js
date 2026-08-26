import SingleArticle from '@/views/SingleArticle';
import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import mongoose from 'mongoose';

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
          images: data.image ? [data.image] : [],
        },
        twitter: {
          card: 'summary_large_image',
          title: data.metaTitle || data.title,
          description: data.metaDescription || data.description,
          images: data.image ? [data.image] : [],
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
  
  try {
    await connectToDatabase();
    if (mongoose.Types.ObjectId.isValid(id)) {
        initialArticle = await News.findById(id).lean();
    }
    if (!initialArticle) {
        initialArticle = await News.findOne({ slug: id }).lean();
    }
    
    if (initialArticle) {
        // Convert MongoDB ObjectId and Dates to strings to pass safely to Client Component
        initialArticle._id = initialArticle._id.toString();
        if (initialArticle.createdAt) initialArticle.createdAt = initialArticle.createdAt.toString();
        if (initialArticle.updatedAt) initialArticle.updatedAt = initialArticle.updatedAt.toString();
    }
  } catch (error) {
    console.error('Error fetching initial article:', error);
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
      image: initialArticle.image ? [initialArticle.image] : [`${siteUrl}/favicon.png`],
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
      <SingleArticle initialArticle={initialArticle} />
    </>
  );
}
