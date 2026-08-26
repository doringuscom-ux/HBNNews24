import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BreakingNews from '@/models/BreakingNews';
import { getAuthUser } from '@/utils/auth';

export async function GET() {
    await dbConnect();
    const authAdmin = await getAuthUser();
    if (!authAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const items = await BreakingNews.find().sort({ createdAt: -1 });
        return NextResponse.json(items);
    } catch (err) {
        console.error('Error fetching all breaking news for admin:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
