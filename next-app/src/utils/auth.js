import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

export async function getAuthUser() {
    const headersList = await headers();
    const token = headersList.get('Authorization');
    
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'fallback_secret_key');
        return decoded.admin || decoded;
    } catch (err) {
        return null;
    }
}
