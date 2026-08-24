import { getHomeVideosData } from '@/lib/getHomeVideos';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const videoData = await getHomeVideosData();
        return NextResponse.json(videoData);
    } catch (error) {
        console.error('Error fetching YouTube Data:', error);
        return NextResponse.json({ message: 'Error fetching videos' }, { status: 500 });
    }
}


