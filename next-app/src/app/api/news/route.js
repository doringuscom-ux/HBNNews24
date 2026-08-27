import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { NextResponse } from 'next/server';
import NodeCache from 'node-cache';
import jwt from 'jsonwebtoken';
import { cleanHtmlFormatting } from '@/utils/cleanHtmlFormatting';

// Initialize cache globally so it persists across requests 
const cache = global.newsCache || new NodeCache({ stdTTL: 120 });
if (!global.newsCache) global.newsCache = cache;

import { revalidatePath } from 'next/cache';

const clearAllNewsCache = () => {
    try {
        if (global.newsCache) global.newsCache.flushAll();
        if (global.newsCategoryCache) global.newsCategoryCache.flushAll();
        revalidatePath('/', 'layout');
    } catch (e) {
        console.error('Error clearing news cache:', e);
    }
};

import Admin from '@/models/Admin';

const verifyAuthToken = async (req) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        const adminData = decoded.admin || decoded;
        let username = adminData.username;
        if (!username && adminData.id) {
            await connectToDatabase();
            const adminDoc = await Admin.findById(adminData.id);
            if (adminDoc) {
                username = adminDoc.username;
            }
        }
        return { ...adminData, username };
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
    const user = await verifyAuthToken(req);
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

    const authorName = (body.author && body.author.trim() !== '') 
      ? body.author.trim() 
      : (user.username || 'एडमिन');

    const newArticle = new News({
      ...body,
      content: cleanHtmlFormatting(body.content || ''),
      category: categoryArr,
      author: authorName
    });

    const savedArticle = await newArticle.save();
    clearAllNewsCache();

    return NextResponse.json(savedArticle, { status: 201 });
  } catch (error) {
    console.error('Error creating news article:', error);
    return NextResponse.json({ message: 'Server error creating article', error: error.message }, { status: 500 });
  }
}
