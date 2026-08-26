import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Admin from '@/models/Admin';
import News from '@/models/News';
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

export async function PUT(req, { params }) {
    await dbConnect();
    const authAdmin = getAuthAdmin(req);
    if (!authAdmin || authAdmin.role !== 'admin') {
        return NextResponse.json({ message: 'Access denied: Admin only' }, { status: 403 });
    }

    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;
        const { username, password, role, email, phone, profileImage, designation } = await req.json();

        const adminToUpdate = await Admin.findById(id);
        if (!adminToUpdate) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        if (username && username !== adminToUpdate.username) {
            const existing = await Admin.findOne({ username: new RegExp('^' + username + '$', 'i') });
            if (existing && existing._id.toString() !== id) {
                return NextResponse.json({ message: 'Username already taken' }, { status: 400 });
            }
            const oldUsername = adminToUpdate.username;
            adminToUpdate.username = username;
            await News.updateMany({ author: oldUsername }, { $set: { author: username } });
        }

        if (password) adminToUpdate.password = password;
        if (role) {
            if (id === authAdmin.id && role !== 'admin') {
                return NextResponse.json({ message: 'You cannot change your own role from admin' }, { status: 400 });
            }
            adminToUpdate.role = role;
        }
        if (email !== undefined) adminToUpdate.email = email;
        if (phone !== undefined) adminToUpdate.phone = phone;
        if (profileImage !== undefined) adminToUpdate.profileImage = profileImage;
        if (designation !== undefined) adminToUpdate.designation = designation.trim() || 'Content Writer';

        await adminToUpdate.save();

        const updated = await Admin.findById(id).select('-password');
        return NextResponse.json({ message: 'User updated successfully', user: updated });
    } catch (err) {
        console.error('Update user error:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    await dbConnect();
    const authAdmin = getAuthAdmin(req);
    if (!authAdmin || authAdmin.role !== 'admin') {
        return NextResponse.json({ message: 'Access denied: Admin only' }, { status: 403 });
    }

    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        if (id === authAdmin.id) {
            return NextResponse.json({ message: 'You cannot delete yourself' }, { status: 400 });
        }

        await Admin.findByIdAndDelete(id);
        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (err) {
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
