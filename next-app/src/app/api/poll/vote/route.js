import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Poll from '@/models/Poll';

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { optionId, pollId } = body;

        if (optionId === undefined || optionId === null) {
            return NextResponse.json({ message: 'Option ID is required' }, { status: 400 });
        }

        let poll = null;
        if (pollId) {
            poll = await Poll.findById(pollId);
        }
        if (!poll) {
            poll = await Poll.findOne({ isActive: true }).sort({ createdAt: -1 });
        }

        if (!poll) {
            return NextResponse.json({ message: 'Poll not found' }, { status: 404 });
        }

        const option = poll.options.find(opt => opt.id === parseInt(optionId));
        if (!option) {
            return NextResponse.json({ message: 'Option not found in this poll' }, { status: 404 });
        }

        // Increment realVotes
        option.realVotes = (option.realVotes || 0) + 1;
        await poll.save();

        let totalVotes = 0;
        poll.options.forEach(opt => {
            totalVotes += ((opt.initialVotes || 0) + (opt.realVotes || 0));
        });

        const formattedOptions = poll.options.map(opt => {
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
            id: poll._id,
            question: poll.question,
            totalVotes: totalVotes,
            options: formattedOptions
        });
    } catch (error) {
        console.error('Error recording vote:', error);
        return NextResponse.json({ message: 'Server error recording vote', error: error.message }, { status: 500 });
    }
}
