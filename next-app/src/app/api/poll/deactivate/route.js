import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Poll from '@/models/Poll';
import { getAuthUser } from '@/utils/auth';

export async function POST() {
    await dbConnect();
    const authAdmin = await getAuthUser();
    if (!authAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await Poll.updateMany({ isActive: true }, { $set: { isActive: false } });
        return NextResponse.json({ message: 'Poll deactivated successfully' });
    } catch (err) {
        console.error('Error deactivating poll:', err);
        return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
    }
}
