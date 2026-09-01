import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Panchang from '@/models/Panchang';
import { getAuthUser } from '@/utils/auth';
import { getTodayPanchang } from '@/utils/panchang';

export async function GET(request) {
    try {
        const panchang = getTodayPanchang();
        // Return as an array to match the previous structure
        return NextResponse.json([panchang]);
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
        const item = new Panchang(body);
        await item.save();
        return NextResponse.json(item, { status: 201 });
    } catch (err) {
        return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
    }
}
