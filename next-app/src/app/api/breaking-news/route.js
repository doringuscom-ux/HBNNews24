import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BreakingNews from '@/models/BreakingNews';
import { getAuthUser } from '@/utils/auth';
import { revalidatePath } from 'next/cache';

export async function GET(request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 100;
        const items = await BreakingNews.find({ isActive: { $ne: false } }).sort({ createdAt: -1 }).limit(limit);
        return NextResponse.json(items);
    } catch (err) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    await dbConnect();
    const authAdmin = await getAuthUser();
    if (!authAdmin) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        const body = await request.json();
        const item = new BreakingNews(body);
        await item.save();

        try {
            revalidatePath('/', 'page');
            revalidatePath('/breaking-news', 'page');
        } catch (e) {}

        return NextResponse.json(item, { status: 201 });
    } catch (err) {
        return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
    }
}
