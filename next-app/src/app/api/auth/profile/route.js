import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';
import News from '@/models/News';
import jwt from 'jsonwebtoken';

const verifyAuth = (req) => {
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
    const adminData = verifyAuth(req);
    if (!adminData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        await connectToDatabase();
        const user = await Admin.findById(adminData.id).select('-password');
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
        return NextResponse.json(user);
    } catch (err) {
        console.error('Fetch own profile error:', err.message);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PUT(req) {
    const adminData = verifyAuth(req);
    if (!adminData) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    try {
        await connectToDatabase();
        const { username, password, email, phone, profileImage, designation } = await req.json();
        
        const adminToUpdate = await Admin.findById(adminData.id);
        if (!adminToUpdate) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (username && username !== adminToUpdate.username) {
            const existing = await Admin.findOne({ username: new RegExp('^' + username + '$', 'i') });
            if (existing && existing._id.toString() !== adminToUpdate._id.toString()) {
                return NextResponse.json({ message: 'Username already taken' }, { status: 400 });
            }
            const oldUsername = adminToUpdate.username;
            adminToUpdate.username = username;
            await News.updateMany({ author: oldUsername }, { $set: { author: username } });
        }

        if (password) adminToUpdate.password = password;
        if (email !== undefined) adminToUpdate.email = email;
        if (phone !== undefined) adminToUpdate.phone = phone;
        if (profileImage !== undefined) adminToUpdate.profileImage = profileImage;
        if (designation !== undefined) adminToUpdate.designation = designation.trim() || 'Content Writer';

        await adminToUpdate.save();

        const updatedUser = await Admin.findById(adminToUpdate._id).select('-password');
        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        console.error('Update own profile error:', err.message);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
