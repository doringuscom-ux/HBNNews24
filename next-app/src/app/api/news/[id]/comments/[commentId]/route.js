import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function PUT(req, { params }) {
    try {
        await connectToDatabase();
        const resolvedParams = await params;
        const commentId = resolvedParams?.commentId;

        const body = await req.json();
        const { text } = body;

        if (!text || !text.trim()) {
            return NextResponse.json({ message: 'Text is required' }, { status: 400 });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { text: text.trim() },
            { new: true }
        );

        if (!updatedComment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        return NextResponse.json({
            _id: updatedComment._id.toString(),
            newsId: updatedComment.newsId.toString(),
            name: updatedComment.name,
            text: updatedComment.text,
            createdAt: updatedComment.createdAt ? updatedComment.createdAt.toString() : new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await connectToDatabase();
        const resolvedParams = await params;
        const commentId = resolvedParams?.commentId;

        const deletedComment = await Comment.findByIdAndDelete(commentId);
        if (!deletedComment) {
            return NextResponse.json({ message: 'Comment not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
