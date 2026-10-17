/** @type {import('next').NextConfig} */
const nextConfig = {
    // Duplicate URLs -> one canonical URL (301) so Google does not split ranking
    async redirects() {
        return [
            { source: '/aboutus', destination: '/about', permanent: true },
            { source: '/contactus', destination: '/contact', permanent: true },
            { source: '/privacypolicy', destination: '/privacy-policy', permanent: true },
            { source: '/termsconditions', destination: '/terms', permanent: true },
            { source: '/editorialpolicy', destination: '/editorial-policy', permanent: true },
            { source: '/factcheckpolicy', destination: '/fact-check-policy', permanent: true },
            { source: '/correctionspolicy', destination: '/corrections-policy', permanent: true },
            { source: '/breakingnewspage', destination: '/breaking-news', permanent: true },
        ];
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com' },
            { protocol: 'https', hostname: 'hbnnews24.com' },
            { protocol: 'https', hostname: 'i.ytimg.com' },
        ],
    },
};

export default nextConfig;
