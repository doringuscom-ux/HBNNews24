import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Admin from '@/models/Admin';

export async function GET(req, { params }) {
  try {
    await connectToDatabase();
    const resolvedParams = await params;
    const rawName = decodeURIComponent(resolvedParams?.name || '');

    if (!rawName) {
      return NextResponse.json({ message: 'Author name required' }, { status: 400 });
    }

    const words = rawName.split(/[-_\s]+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const cleanedName = rawName.replace(/-/g, ' ').trim();

    if (words.length === 0) {
      return NextResponse.json({
        username: cleanedName,
        profileImage: '',
        email: '',
        phone: '',
      });
    }

    const regexPattern = new RegExp(words.join('[\\s\\-_]+'), 'i');

    const author = await Admin.findOne({
      username: { $regex: regexPattern }
    }).select('-password');

    if (!author) {
      return NextResponse.json({
        username: cleanedName,
        profileImage: '',
        email: '',
        phone: '',
      });
    }

    return NextResponse.json({
      username: author.username,
      profileImage: author.profileImage || '',
      email: author.email || '',
      phone: author.phone || '',
      role: author.role || 'user'
    });
  } catch (error) {
    console.error('Error fetching author profile:', error);
    return NextResponse.json({
      username: '',
      profileImage: '',
      email: '',
      phone: '',
    });
  }
}
