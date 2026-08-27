import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Poll from '@/models/Poll';
import { getAuthUser } from '@/utils/auth';

export async function GET(request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 100;
        const items = await Poll.find().sort({ createdAt: -1 }).limit(limit);
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
        const { question, options } = body;

        let activePoll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });

        if (activePoll) {
            // Update active poll
            activePoll.question = question;
            activePoll.options = (options || []).map(opt => {
                const prevOpt = activePoll.options.find(p => p.id === opt.id);
                return {
                    id: opt.id,
                    text: opt.text,
                    emoji: opt.emoji || '',
                    initialVotes: parseInt(opt.initialVotes) || 0,
                    realVotes: opt.realVotes !== undefined ? parseInt(opt.realVotes) : (prevOpt?.realVotes || 0)
                };
            });
            activePoll.isActive = true;
            await activePoll.save();
            return NextResponse.json(activePoll, { status: 200 });
        } else {
            // Create new active poll
            await Poll.updateMany({}, { $set: { isActive: false } });
            const item = new Poll({
                question,
                options: (options || []).map(opt => ({
                    id: opt.id,
                    text: opt.text,
                    emoji: opt.emoji || '',
                    initialVotes: parseInt(opt.initialVotes) || 0,
                    realVotes: parseInt(opt.realVotes) || 0
                })),
                isActive: true
            });
            await item.save();
            return NextResponse.json(item, { status: 201 });
        }
    } catch (err) {
        console.error('Error saving poll:', err);
        return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
    }
}
