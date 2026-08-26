import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';

export async function PUT(req, { params }) {
    try {
        await connectToDatabase();
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        let query = {};
        if (mongoose.Types.ObjectId.isValid(id)) {
            query = { _id: id };
        } else {
            query = { slug: id };
        }

        const updatedArticle = await News.findOneAndUpdate(
            query,
            { $inc: { likes: 1 } },
            { new: true }
        );

        if (!updatedArticle) {
            return NextResponse.json({ message: 'Article not found' }, { status: 404 });
        }

        return NextResponse.json({ likes: updatedArticle.likes || 0 });
    } catch (error) {
        console.error('Error liking article:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
