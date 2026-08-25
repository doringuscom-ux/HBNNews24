export const optimizeImage = (url, width = 800) => {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('cloudinary.com') && url.includes('/upload/')) {
        // Find existing transformations and replace them.
        // Matches /upload/ followed by any optional transformations, up to either v<numbers>/ or hbn24_news/
        const regex = /\/upload\/(?:[^\/]+\/)*(v\d+\/|hbn24_news\/)/;
        if (regex.test(url)) {
            return url.replace(regex, `/upload/q_auto,f_auto,w_${width}/$1`);
        } else if (!url.includes('q_auto,f_auto')) {
            return url.replace('/upload/', `/upload/q_auto,f_auto,w_${width}/`);
        }
    }
    return url;
};
