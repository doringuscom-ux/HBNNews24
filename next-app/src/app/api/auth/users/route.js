import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import jwt from 'jsonwebtoken';

const getAuthAdmin = (req) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return null;
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        return decoded.admin;
    } catch {
        return null;
    }
};

export async function GET(req) {
    await dbConnect();
    const authAdmin = getAuthAdmin(req);
    if (!authAdmin || authAdmin.role !== 'admin') {
        return NextResponse.json({ message: 'Access denied: Admin only' }, { status: 403 });
    }

    try {
        const users = await Admin.find().select('-password').sort({ createdAt: -1 });
        return NextResponse.json(users);
    } catch (err) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function POST(req) {
    await dbConnect();
    const authAdmin = getAuthAdmin(req);
    if (!authAdmin || authAdmin.role !== 'admin') {
        return NextResponse.json({ message: 'Access denied: Admin only' }, { status: 403 });
    }

    try {
        const { username, password, role, email, phone, profileImage, designation } = await req.json();
        let admin = await Admin.findOne({ username: new RegExp('^' + username + '$', 'i') });
        if (admin) return NextResponse.json({ message: 'User already exists' }, { status: 400 });

        admin = new Admin({
            username,
            password,
            role: role || 'user',
            email,
            phone,
            profileImage,
            designation: designation?.trim() || 'Content Writer'
        });
        await admin.save();
        return NextResponse.json({ message: 'User created successfully', user: admin }, { status: 201 });
    } catch (err) {
        console.error('Create user error:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
