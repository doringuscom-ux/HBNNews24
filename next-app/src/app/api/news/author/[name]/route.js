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

    // Split words by hyphens, underscores, or spaces to safely match
    const words = rawName.split(/[-_\s]+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (words.length === 0) {
      return NextResponse.json([]);
    }

    const regexPattern = new RegExp(words.join('[\\s\\-_]+'), 'i');

    const newsList = await News.find({
      author: { $regex: regexPattern },
      status: { $ne: 'draft' }
    }).sort({ createdAt: -1 });

    return NextResponse.json(newsList || []);
  } catch (error) {
    console.error('Error fetching author news:', error);
    return NextResponse.json([], { status: 200 }); // Return empty array so UI doesn't crash
  }
}
