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

export default function Page() {
  return <SingleArticle />;
}
