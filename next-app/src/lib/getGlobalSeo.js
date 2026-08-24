import connectToDatabase from '@/lib/mongodb';
import GlobalSeo from '@/models/GlobalSeo';
import { cache } from 'react';

export const getGlobalSeo = cache(async () => {
    try {
        await connectToDatabase();
        const seo = await GlobalSeo.findOne().lean();
        return seo ? JSON.parse(JSON.stringify(seo)) : null;
    } catch (error) {
        console.error('Error fetching global SEO:', error);
        return null;
    }
});
