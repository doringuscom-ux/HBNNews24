import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Poll from '@/models/Poll';

export async function GET() {
    await dbConnect();
    try {
        const activePoll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
        if (!activePoll) {
            return NextResponse.json({ message: 'No active poll found.' }, { status: 404 });
        }

        let totalVotes = 0;
        activePoll.options.forEach(opt => {
            totalVotes += (opt.initialVotes + opt.realVotes);
        });

        const formattedOptions = activePoll.options.map(opt => {
            const optionTotal = (opt.initialVotes || 0) + (opt.realVotes || 0);
            const percentage = totalVotes === 0 ? 0 : Math.round((optionTotal / totalVotes) * 100);
            return {
                id: opt.id,
                text: opt.text,
                emoji: opt.emoji,
                initialVotes: opt.initialVotes || 0,
                realVotes: opt.realVotes || 0,
                percentage: percentage
            };
        });

        return NextResponse.json({
            id: activePoll._id,
            question: activePoll.question,
            totalVotes: totalVotes,
            options: formattedOptions
        });
    } catch (error) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
