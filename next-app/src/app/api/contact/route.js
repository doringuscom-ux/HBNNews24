import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ContactMessage from '@/models/ContactMessage';
import jwt from 'jsonwebtoken';

const GOOGLE_SCRIPT_WEBHOOK_URL = process.env.GOOGLE_CONTACT_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycby4ScoIr5hpMgT5t-GvCviomZY2xDqRk7mxQ5Kgo0rRbmgSBx1lOtDwt2puscXeS9MU/exec';

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

// GET: Admin only - Fetch all contact messages
export async function GET(request) {
    try {
        const user = verifyAuthToken(request);
        if (!user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')) : 100;
        const items = await ContactMessage.find().sort({ createdAt: -1 }).limit(limit);
        return NextResponse.json(items);
    } catch (err) {
        console.error('Error fetching contact messages:', err);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

// POST: Public - Anyone can submit the contact form
export async function POST(request) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ error: 'Please fill in all required fields (Name, Email, Message).' }, { status: 400 });
        }

        const newMsg = new ContactMessage({
            name: name.trim(),
            email: email.trim(),
            subject: (subject || 'General Inquiry').trim(),
            message: message.trim(),
            status: 'new'
        });

        await newMsg.save();

        // Send Email via Google Apps Script Webhook asynchronously
        try {
            if (GOOGLE_SCRIPT_WEBHOOK_URL) {
                fetch(GOOGLE_SCRIPT_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        name: newMsg.name,
                        email: newMsg.email,
                        subject: newMsg.subject,
                        message: newMsg.message
                    })
                }).catch(scriptErr => console.error('Google Apps Script Notification Error:', scriptErr));
            }
        } catch (scriptErr) {
            console.error('Failed to trigger email notification:', scriptErr);
        }

        return NextResponse.json({ message: 'Message sent successfully!', data: newMsg }, { status: 201 });
    } catch (err) {
        console.error('Error submitting contact form:', err);
        return NextResponse.json({ error: 'Server error while submitting message: ' + err.message }, { status: 500 });
    }
}
