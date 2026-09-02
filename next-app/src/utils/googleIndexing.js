import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';

// Path to the service account JSON key you provided
// Looking in the root of the next.js app (process.cwd())
const keyPath = path.join(process.cwd(), 'hbn-indexing.json');

let jwtClient = null;

// Initialize the JWT Client
if (process.env.GOOGLE_INDEXING_CLIENT_EMAIL && process.env.GOOGLE_INDEXING_PRIVATE_KEY) {
    try {
        jwtClient = new google.auth.JWT({
            email: process.env.GOOGLE_INDEXING_CLIENT_EMAIL,
            key: process.env.GOOGLE_INDEXING_PRIVATE_KEY.replace(/\\n/g, '\n'), // handle newlines in env vars
            scopes: ['https://www.googleapis.com/auth/indexing']
        });
        console.log('Google Indexing API Client initialized from Environment Variables.');
    } catch (error) {
        console.error('Error parsing Google Indexing ENV variables:', error);
    }
} else if (fs.existsSync(keyPath)) {
    try {
        // Read file synchronously
        const keyFile = fs.readFileSync(keyPath, 'utf8');
        const key = JSON.parse(keyFile);
        jwtClient = new google.auth.JWT({
            email: key.client_email,
            key: key.private_key,
            scopes: ['https://www.googleapis.com/auth/indexing']
        });
        console.log('Google Indexing API Client initialized from JSON file.');
    } catch (error) {
        console.error('Error parsing Google Indexing JSON key:', error);
    }
} else {
    console.error(`Google Indexing Key not found. Please set ENV variables or provide ${keyPath}`);
}

/**
 * Notify Google Search Console about a URL update or deletion.
 * @param {string} url - The absolute URL of the news article (e.g., https://hbnnews24.com/news/slug)
 * @param {string} type - 'URL_UPDATED' or 'URL_DELETED'
 */
export async function notifyGoogleIndexing(url, type = 'URL_UPDATED') {
    if (!jwtClient) {
        console.warn('Google Indexing API not initialized. Skipping notification for:', url);
        return;
    }

    try {
        await jwtClient.authorize();
        const indexing = google.indexing({ version: 'v3', auth: jwtClient });
        
        const response = await indexing.urlNotifications.publish({
            requestBody: {
                url: url,
                type: type
            }
        });
        
        console.log(`Google Indexing API Success [${type}]:`, url);
        return response.data;
    } catch (error) {
        console.error(`Google Indexing API Error for ${url}:`, error.message || error);
    }
}
