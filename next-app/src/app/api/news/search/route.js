import connectToDatabase from '@/lib/mongodb';
import News from '@/models/News';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await connectToDatabase();
        
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json([], { status: 200 });
        }

        const searchResults = await News.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } },
                { metaKeywords: { $regex: query, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        return NextResponse.json(searchResults, { status: 200 });
    } catch (error) {
        console.error('Error in search API:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
