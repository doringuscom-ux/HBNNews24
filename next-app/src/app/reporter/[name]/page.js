import ReporterProfile from '@/views/ReporterProfile';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import News from '@/models/News';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawName = decodeURIComponent(resolvedParams?.name || '');
  let displayName = rawName 
    ? rawName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) 
    : 'Reporter';

  if (rawName.toLowerCase() === 'admin' || rawName.toLowerCase() === 'एडमिन' || rawName.toLowerCase() === 'shiv-kumar') {
    displayName = 'Shiv Kumar';
  }

  return {
    title: `${displayName} - Chief Editor & Articles | HBN News 24`,
    description: `Read exclusive news reports, ground coverage, and latest articles written by ${displayName} on HBN News 24.`,
    robots: 'index, follow',
    alternates: {
      canonical: `/reporter/${rawName}`,
    },
    openGraph: {
      title: `${displayName} - Reporter Profile | HBN News 24`,
      description: `Articles and news reports by ${displayName} on HBN News 24.`,
      type: 'profile',
    },
  };
}

export default async function Page({ params }) {
  const resolvedParams = await params;
  const rawName = decodeURIComponent(resolvedParams?.name || '');

  let initialProfile = null;
  let initialNews = [];
  let initialLatestNews = [];

  try {
    await connectToDatabase();

    const lowerName = rawName.toLowerCase().trim();
    const isAdminAlias = lowerName === 'shiv-kumar' || lowerName === 'shiv kumar' || lowerName === 'admin' || lowerName === 'एडमिन';

    let newsQuery = {};
    let adminQuery = {};

    if (isAdminAlias) {
      newsQuery = {
        author: { $in: [/shiv[\s\-_]*kumar/i, /admin/i, /एडमिन/] },
        status: { $ne: 'draft' }
      };
      adminQuery = {
        username: { $in: [/admin/i, /shiv/i] }
      };
    } else {
      const words = rawName.split(/[-_\s]+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      const regexPattern = words.length > 0 ? new RegExp(words.join('[\\s\\-_]+'), 'i') : null;
      newsQuery = regexPattern ? { author: { $regex: regexPattern }, status: { $ne: 'draft' } } : {};
      adminQuery = regexPattern ? { username: { $regex: regexPattern } } : {};
    }

    // Run parallel lean queries directly on Server
    const [authorDoc, authorNewsDocs, latestNewsDocs] = await Promise.all([
      Admin.findOne(adminQuery).select('-password').lean(),
      News.find(newsQuery)
        .select('title slug image category createdAt author')
        .sort({ createdAt: -1 })
        .limit(60)
        .lean(),
      News.find({ status: { $ne: 'draft' } })
        .select('title slug image createdAt')
        .sort({ createdAt: -1 })
        .limit(15)
        .lean()
    ]);

    if (authorDoc) {
      initialProfile = {
        username: isAdminAlias ? 'Shiv Kumar' : authorDoc.username,
        profileImage: authorDoc.profileImage || '',
        email: authorDoc.email || '',
        phone: authorDoc.phone || '',
      };
    } else if (isAdminAlias) {
      initialProfile = {
        username: 'Shiv Kumar',
        profileImage: '',
        email: '',
        phone: '',
      };
    }

    initialNews = JSON.parse(JSON.stringify(authorNewsDocs || []));
    initialLatestNews = JSON.parse(JSON.stringify(latestNewsDocs || []));
  } catch (err) {
    console.error('SSR prefetch error for reporter:', err);
  }

  return (
    <ReporterProfile 
      name={rawName.toLowerCase() === 'admin' || rawName.toLowerCase() === 'एडमिन' ? 'shiv-kumar' : rawName}
      initialProfile={initialProfile}
      initialNews={initialNews}
      initialLatestNews={initialLatestNews}
    />
  );
}
