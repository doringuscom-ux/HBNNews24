import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import NodeCache from 'node-cache';

const cache = global.newsCategoryCache || new NodeCache({ stdTTL: 120 });
if (!global.newsCategoryCache) global.newsCategoryCache = cache;

export async function GET(req, { params }) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;
        if (!id) {
            return NextResponse.json({ message: 'Parameter is required' }, { status: 400 });
        }

        await connectToDatabase();

        // 1. Check if this is a category request (e.g. sports, entertainment, punjab, etc.)
        const cacheKey = `news_category_${id.toLowerCase()}`;
        if (cache.has(cacheKey)) {
            return NextResponse.json(cache.get(cacheKey));
        }

        const categoryNews = await News.find({ 
            category: { $regex: new RegExp(`^${id}$`, 'i') } 
        }).sort({ createdAt: -1 });

        if (categoryNews && categoryNews.length > 0) {
            cache.set(cacheKey, categoryNews);
            return NextResponse.json(categoryNews);
        }

        // 2. If not category, check if it's an article ID or slug
        let article = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
            article = await News.findById(id);
        }
        if (!article) {
            article = await News.findOne({ slug: id });
        }

        if (article) {
            return NextResponse.json(article);
        }

        // If nothing found, return empty array
        return NextResponse.json([]);
    } catch (error) {
        console.error('Error fetching news by id/category:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
