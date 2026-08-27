import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BreakingNews from '@/models/BreakingNews';
import { getAuthUser } from '@/utils/auth';
import { revalidatePath } from 'next/cache';

export async function PUT(request, { params }) {
    await dbConnect();
    const authAdmin = await getAuthUser();
    if (!authAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;
        const body = await request.json();
        const { isActive, text } = body;

        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (text !== undefined) updateData.text = text.trim();

        const updated = await BreakingNews.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ message: 'Breaking news not found' }, { status: 404 });
        }

        try {
            revalidatePath('/', 'page');
            revalidatePath('/breaking-news', 'page');
        } catch (e) {}

        return NextResponse.json(updated);
    } catch (err) {
        console.error('Error updating breaking news:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    await dbConnect();
    const authAdmin = await getAuthUser();
    if (!authAdmin) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        const deleted = await BreakingNews.findByIdAndDelete(id);
        if (!deleted) {
            return NextResponse.json({ message: 'Breaking news not found' }, { status: 404 });
        }

        try {
            revalidatePath('/', 'page');
            revalidatePath('/breaking-news', 'page');
        } catch (e) {}

        return NextResponse.json({ message: 'Breaking news deleted' });
    } catch (err) {
        console.error('Error deleting breaking news:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
