import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import jwt from 'jsonwebtoken';

// Initialize cache globally so it persists across requests 
const cache = global.newsCache || new NodeCache({ stdTTL: 120 });
if (!global.newsCache) global.newsCache = cache;

const clearAllNewsCache = () => {
    try {
        if (global.newsCache) global.newsCache.flushAll();
        if (global.newsCategoryCache) global.newsCategoryCache.flushAll();
    } catch (e) {
        console.error('Error clearing news cache:', e);
    }
};

const verifyAuthToken = (req) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    } catch (e) {
        return null;
    }
};

export async function GET() {
  try {
    await connectToDatabase();
    const cacheKey = 'all_news';

    if (cache.has(cacheKey)) {
      return NextResponse.json(cache.get(cacheKey));
    }

    const newsList = await News.find().sort({ createdAt: -1 });
    cache.set(cacheKey, newsList);

    return NextResponse.json(newsList);
  } catch (error) {
    console.error('Error fetching all news:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = verifyAuthToken(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    // Ensure category is array of trimmed strings
    let categoryArr = [];
    if (Array.isArray(body.category)) {
      categoryArr = body.category.map(c => typeof c === 'string' ? c.trim() : c).filter(Boolean);
    } else if (typeof body.category === 'string' && body.category.trim() !== '') {
      categoryArr = [body.category.trim()];
    }

    const newArticle = new News({
      ...body,
      category: categoryArr,
      author: user.username || body.author || 'एडमिन'
    });

    const savedArticle = await newArticle.save();
    clearAllNewsCache();

    return NextResponse.json(savedArticle, { status: 201 });
  } catch (error) {
    console.error('Error creating news article:', error);
    return NextResponse.json({ message: 'Server error creating article', error: error.message }, { status: 500 });
  }
}
