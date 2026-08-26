import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import jwt from 'jsonwebtoken';

const verifyAuthToken = (req) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
    } catch (e) {
        return null;
    }
};

export async function DELETE(request, { params }) {
    try {
        const user = verifyAuthToken(request);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams?.id;
        if (!id) {
            return NextResponse.json({ message: 'Message ID is required' }, { status: 400 });
        }

        await connectToDatabase();
        const deleted = await ContactMessage.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Message deleted successfully' });
    } catch (err) {
        console.error('Error deleting contact message:', err);
        return NextResponse.json({ message: 'Server error', error: err.message }, { status: 500 });
    }
}
