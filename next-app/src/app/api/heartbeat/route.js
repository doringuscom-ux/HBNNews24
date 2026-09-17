import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
    const targetUrl = `${siteUrl}/api/health`;

    try {
        const response = await fetch(targetUrl, {
            headers: { 'User-Agent': 'HBN24-Heartbeat/1.0' },
            cache: 'no-store'
        });

        return NextResponse.json({
            status: 'ok',
            message: 'Heartbeat ping executed successfully',
            target: targetUrl,
            targetStatus: response.status,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            target: targetUrl,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
