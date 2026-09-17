export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const TWELVE_MINUTES = 12 * 60 * 1000;
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hbnnews24.com';
        const targetUrl = `${siteUrl}/api/health`;

        if (!global.__heartbeatTimer) {
            console.log(`[HBN24 Heartbeat] Service started. Pinging ${targetUrl} every 12 minutes.`);
            
            // Initial delay of 1 minute before first ping to allow server startup
            setTimeout(() => {
                const runPing = async () => {
                    try {
                        const res = await fetch(targetUrl, {
                            headers: { 'User-Agent': 'HBN24-Internal-Heartbeat/1.0' },
                            cache: 'no-store'
                        });
                        console.log(`[HBN24 Heartbeat] Self-ping successful (Status: ${res.status}) at ${new Date().toISOString()}`);
                    } catch (err) {
                        console.error(`[HBN24 Heartbeat] Self-ping error:`, err.message);
                    }
                };

                // Run immediately after initial delay, then every 12 minutes
                runPing();
                global.__heartbeatTimer = setInterval(runPing, TWELVE_MINUTES);
            }, 60 * 1000);
        }
    }
}
