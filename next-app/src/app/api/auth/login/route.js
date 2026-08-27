import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { username, password } = body;
        const admin = await Admin.findOne({ username });
        if (!admin) return NextResponse.json({ message: 'Invalid Credentials' }, { status: 400 });

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return NextResponse.json({ message: 'Invalid Credentials' }, { status: 400 });

        const payload = { admin: { id: admin.id, username: admin.username, role: admin.role || 'user' } };
        const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '24h' });

        return NextResponse.json({ token, username: admin.username, role: admin.role || 'user' });
    } catch (err) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
