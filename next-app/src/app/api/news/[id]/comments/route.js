import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Comment from '@/models/Comment';
import News from '@/models/News';

async function findArticle(id) {
    let article = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
        article = await News.findById(id);
    }
    if (!article) {
        article = await News.findOne({ slug: id });
    }
    return article;
}

export async function GET(req, { params }) {
    try {
        await connectToDatabase();
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        const article = await findArticle(id);
        if (!article) {
            return NextResponse.json({ message: 'News not found' }, { status: 404 });
        }

        const comments = await Comment.find({ newsId: article._id }).sort({ createdAt: -1 }).lean();
        const serialized = comments.map(c => ({
            ...c,
            _id: c._id.toString(),
            newsId: c.newsId.toString(),
            createdAt: c.createdAt ? c.createdAt.toString() : null,
        }));

        return NextResponse.json(serialized);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        await connectToDatabase();
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        const body = await req.json();
        const { name, text } = body;

        if (!name || !text || !name.trim() || !text.trim()) {
            return NextResponse.json({ message: 'Name and text are required' }, { status: 400 });
        }

        const article = await findArticle(id);
        if (!article) {
            return NextResponse.json({ message: 'News not found' }, { status: 404 });
        }

        const newComment = new Comment({
            newsId: article._id,
            name: name.trim(),
            text: text.trim()
        });

        await newComment.save();

        return NextResponse.json({
            _id: newComment._id.toString(),
            newsId: newComment.newsId.toString(),
            name: newComment.name,
            text: newComment.text,
            createdAt: newComment.createdAt ? newComment.createdAt.toString() : new Date().toISOString()
        }, { status: 201 });
    } catch (error) {
        console.error('Error posting comment:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
