import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import NodeCache from 'node-cache';
import jwt from 'jsonwebtoken';
import { cleanHtmlFormatting } from '@/utils/cleanHtmlFormatting';
import { notifyGoogleIndexing } from '@/utils/googleIndexing';

const cache = global.newsCategoryCache || new NodeCache({ stdTTL: 120 });
if (!global.newsCategoryCache) global.newsCategoryCache = cache;

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

export async function PUT(req, { params }) {
    try {
        const user = await verifyAuthToken(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams?.id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Valid Article ID is required' }, { status: 400 });
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

        const updateData = {
            ...body,
            category: categoryArr
        };

        if (body.content) {
            updateData.content = cleanHtmlFormatting(body.content);
        }

        if (body.author && body.author.trim() !== '') {
            updateData.author = body.author.trim();
        }

        const updatedNews = await News.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedNews) {
            return NextResponse.json({ message: 'Article not found' }, { status: 404 });
        }

        clearAllNewsCache();

        // Trigger Google Indexing API
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
        const articleUrl = `${siteUrl}/news/${updatedNews.slug || updatedNews._id}`;
        notifyGoogleIndexing(articleUrl, 'URL_UPDATED').catch(console.error);

        return NextResponse.json(updatedNews);
    } catch (error) {
        console.error('Error updating news article:', error);
        return NextResponse.json({ message: 'Server error updating article', error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const user = await verifyAuthToken(req);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams?.id;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Valid Article ID is required' }, { status: 400 });
        }

        await connectToDatabase();
        const deletedNews = await News.findByIdAndDelete(id);
        if (!deletedNews) {
            return NextResponse.json({ message: 'Article not found' }, { status: 404 });
        }

        clearAllNewsCache();

        // Trigger Google Indexing API
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
        const articleUrl = `${siteUrl}/news/${deletedNews.slug || deletedNews._id}`;
        notifyGoogleIndexing(articleUrl, 'URL_DELETED').catch(console.error);

        return NextResponse.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting news article:', error);
        return NextResponse.json({ message: 'Server error deleting article', error: error.message }, { status: 500 });
    }
}
