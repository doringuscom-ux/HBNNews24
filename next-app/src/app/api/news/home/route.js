import { getHomeNewsData } from '@/lib/getHomeNews';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const homeData = await getHomeNewsData();
        return NextResponse.json(homeData);
    } catch (error) {
        console.error('Error fetching home news:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

