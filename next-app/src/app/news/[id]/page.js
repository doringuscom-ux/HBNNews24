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
      return {
        title: data.metaTitle || data.title || 'HBN24 News',
        description: data.metaDescription || '',
        keywords: data.metaKeywords || '',
        robots: data.robots || 'index, follow',
        alternates: {
          canonical: `https://hbnnews24.com/news/${data.slug || data._id || id}`,
        },
        openGraph: {
          title: data.metaTitle || data.title,
          description: data.metaDescription,
          images: [data.image],
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

  return <SingleArticle initialArticle={initialArticle} />;
}
