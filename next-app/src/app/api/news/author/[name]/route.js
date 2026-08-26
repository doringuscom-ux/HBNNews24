import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';

export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const rawName = decodeURIComponent(resolvedParams?.name || '');
    
    if (!rawName) {
      return NextResponse.json([]);
    }

    const lowerName = rawName.toLowerCase().trim();
    const isAdminAlias = lowerName === 'shiv-kumar' || lowerName === 'shiv kumar' || lowerName === 'admin' || lowerName === 'एडमिन';

    let query = {};
    if (isAdminAlias) {
      query = {
        author: { $in: [/shiv[\s\-_]*kumar/i, /admin/i, /एडमिन/] },
        status: { $ne: 'draft' }
      };
    } else {
      const words = rawName.split(/[-_\s]+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      if (words.length === 0) {
        return NextResponse.json([]);
      }
      const regexPattern = new RegExp(words.join('[\\s\\-_]+'), 'i');
      query = {
        author: { $regex: regexPattern },
        status: { $ne: 'draft' }
      };
    }

    const newsList = await News.find(query)
      .select('title slug image category createdAt author')
      .sort({ createdAt: -1 })
      .limit(60)
      .lean();

    return NextResponse.json(newsList || []);
  } catch (error) {
    console.error('Error fetching author news:', error);
    return NextResponse.json([], { status: 200 });
  }
}
